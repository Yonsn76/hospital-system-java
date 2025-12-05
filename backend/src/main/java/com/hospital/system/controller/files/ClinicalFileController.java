package com.hospital.system.controller.files;

import com.hospital.system.dto.files.ClinicalFileRequest;
import com.hospital.system.dto.files.ClinicalFileResponse;
import com.hospital.system.dto.files.ClinicalFileSearchRequest;
import com.hospital.system.dto.files.FileAccessLogResponse;
import com.hospital.system.model.auth.AccessAction;
import com.hospital.system.model.files.FileType;
import com.hospital.system.service.files.ClinicalFileService;
import com.hospital.system.service.files.FileAccessLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for clinical file operations.
 * Implements endpoints as per Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */
@RestController
@RequestMapping("/api/clinical-files")
@RequiredArgsConstructor
public class ClinicalFileController {

    private final ClinicalFileService clinicalFileService;
    private final FileAccessLogService fileAccessLogService;


    /**
     * Upload a clinical file (multipart)
     * Requirements 6.1: Accept PDF, image formats (JPG, PNG), and DICOM files up to 50MB
     * Requirements 6.2: Categorize by type (radiografía, consentimiento, laboratorio, otro)
     */
    @PostMapping("/upload")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<ClinicalFileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam("fileType") FileType fileType,
            HttpServletRequest request,
            Authentication authentication) {
        
        Long uploadedBy = getCurrentUserId();
        ClinicalFileRequest fileRequest = ClinicalFileRequest.builder()
                .patientId(patientId)
                .fileType(fileType)
                .build();
        
        ClinicalFileResponse response = clinicalFileService.uploadFile(file, fileRequest, uploadedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get file metadata by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<ClinicalFileResponse> getFileById(
            @PathVariable Long id,
            HttpServletRequest request,
            Authentication authentication) {
        
        // Log view access for audit (Requirements 6.4)
        Long userId = getCurrentUserId();
        String ipAddress = getClientIpAddress(request);
        fileAccessLogService.logAccess(id, userId, AccessAction.VIEW, ipAddress);
        
        return ResponseEntity.ok(clinicalFileService.getFileById(id));
    }

    /**
     * Download a clinical file
     * Requirements 6.4: Log the access for audit purposes
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            HttpServletRequest request,
            Authentication authentication) {
        
        // Log download access for audit (Requirements 6.4)
        Long userId = getCurrentUserId();
        String ipAddress = getClientIpAddress(request);
        fileAccessLogService.logAccess(id, userId, AccessAction.DOWNLOAD, ipAddress);
        
        ClinicalFileResponse fileInfo = clinicalFileService.getFileById(id);
        Resource resource = clinicalFileService.downloadFile(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + fileInfo.getFileName() + "\"")
                .body(resource);
    }

    /**
     * List patient files organized by category and date
     * Requirements 6.3: Display documents organized by category and date
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<List<ClinicalFileResponse>> getFilesByPatient(
            @PathVariable Long patientId,
            Authentication authentication) {
        return ResponseEntity.ok(clinicalFileService.getFilesByPatient(patientId));
    }

    /**
     * List patient files filtered by type
     */
    @GetMapping("/patient/{patientId}/type/{fileType}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<List<ClinicalFileResponse>> getFilesByPatientAndType(
            @PathVariable Long patientId,
            @PathVariable FileType fileType,
            Authentication authentication) {
        return ResponseEntity.ok(clinicalFileService.getFilesByPatientAndType(patientId, fileType));
    }

    /**
     * Search documents by patient, date range, and document type
     * Requirements 6.5: Filter by patient, date range, and document type
     */
    @GetMapping("/search")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<List<ClinicalFileResponse>> searchFiles(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) FileType fileType,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            Authentication authentication) {
        
        ClinicalFileSearchRequest searchRequest = ClinicalFileSearchRequest.builder()
                .patientId(patientId)
                .fileType(fileType)
                .startDate(startDate)
                .endDate(endDate)
                .build();
        
        return ResponseEntity.ok(clinicalFileService.searchFiles(searchRequest));
    }

    /**
     * Delete a clinical file
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long id,
            Authentication authentication) {
        clinicalFileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get access logs for a specific file (audit trail)
     * Requirements 6.4: Audit logging for file access
     */
    @GetMapping("/{id}/access-logs")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'archivos')")
    public ResponseEntity<List<FileAccessLogResponse>> getFileAccessLogs(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(fileAccessLogService.getAccessLogsByFile(id));
    }

    /**
     * Get the current authenticated user's ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() != null) {
            // Assuming the principal contains user ID or we can extract it
            // This may need adjustment based on your security configuration
            try {
                return Long.parseLong(authentication.getName());
            } catch (NumberFormatException e) {
                // If username is not numeric, return a default or handle differently
                return 1L; // Default user ID for now
            }
        }
        return 1L; // Default user ID
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
