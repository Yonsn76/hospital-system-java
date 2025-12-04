package com.hospital.system.service;

import com.hospital.system.dto.ClinicalFileRequest;
import com.hospital.system.dto.ClinicalFileResponse;
import com.hospital.system.dto.ClinicalFileSearchRequest;
import com.hospital.system.model.ClinicalFile;
import com.hospital.system.model.FileType;
import com.hospital.system.repository.ClinicalFileRepository;
import com.hospital.system.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalFileService {

    private final ClinicalFileRepository clinicalFileRepository;
    private final PatientRepository patientRepository;

    @Value("${clinical.files.storage-path:./clinical-files}")
    private String storagePath;

    @Value("${clinical.files.max-size:52428800}") // 50MB default
    private long maxFileSize;

    // Allowed MIME types based on Requirements 6.1
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/dicom",
            "image/dicom"
    );

    // Allowed file extensions
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".pdf", ".jpg", ".jpeg", ".png", ".dcm", ".dicom"
    );

    @Transactional
    public ClinicalFileResponse uploadFile(MultipartFile file, ClinicalFileRequest request, Long uploadedBy) {
        validatePatientExists(request.getPatientId());
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String uniqueFilename = generateUniqueFilename(originalFilename);
        Path targetPath = getStoragePath(request.getPatientId(), uniqueFilename);

        try {
            // Create directories if they don't exist
            Files.createDirectories(targetPath.getParent());

            // Save file to storage
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            // Create database record
            ClinicalFile clinicalFile = ClinicalFile.builder()
                    .patientId(request.getPatientId())
                    .fileName(originalFilename)
                    .fileType(request.getFileType())
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .storagePath(targetPath.toString())
                    .uploadedBy(uploadedBy)
                    .build();

            ClinicalFile savedFile = clinicalFileRepository.save(clinicalFile);
            return mapToResponse(savedFile);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }


    @Transactional(readOnly = true)
    public ClinicalFileResponse getFileById(Long id) {
        ClinicalFile clinicalFile = clinicalFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinical file not found with id: " + id));
        return mapToResponse(clinicalFile);
    }

    @Transactional(readOnly = true)
    public Resource downloadFile(Long id) {
        ClinicalFile clinicalFile = clinicalFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinical file not found with id: " + id));

        try {
            Path filePath = Paths.get(clinicalFile.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + clinicalFile.getFileName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error reading file: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<ClinicalFileResponse> getFilesByPatient(Long patientId) {
        validatePatientExists(patientId);
        return clinicalFileRepository.findByPatientIdOrderByUploadedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClinicalFileResponse> getFilesByPatientAndType(Long patientId, FileType fileType) {
        validatePatientExists(patientId);
        return clinicalFileRepository.findByPatientIdAndFileType(patientId, fileType)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClinicalFileResponse> searchFiles(ClinicalFileSearchRequest searchRequest) {
        if (searchRequest.getPatientId() != null) {
            validatePatientExists(searchRequest.getPatientId());
        }
        
        return clinicalFileRepository.searchFiles(
                searchRequest.getPatientId(),
                searchRequest.getFileType(),
                searchRequest.getStartDate(),
                searchRequest.getEndDate()
        ).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFile(Long id) {
        ClinicalFile clinicalFile = clinicalFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinical file not found with id: " + id));

        // Delete physical file
        try {
            Path filePath = Paths.get(clinicalFile.getStoragePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log warning but continue with database deletion
            System.err.println("Warning: Could not delete physical file: " + e.getMessage());
        }

        // Delete database record
        clinicalFileRepository.delete(clinicalFile);
    }

    /**
     * Validates file size and type according to Requirements 6.1
     * Accepts PDF, image formats (JPG, PNG), and DICOM files up to 50MB
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty or null");
        }

        // Validate file size (max 50MB)
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size of 50MB");
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("Invalid file type. Allowed types: PDF, JPG, PNG, DICOM");
        }

        // Validate file extension
        String filename = file.getOriginalFilename();
        if (filename != null) {
            String extension = getFileExtension(filename).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new RuntimeException("Invalid file extension. Allowed extensions: .pdf, .jpg, .jpeg, .png, .dcm, .dicom");
            }
        }
    }

    private String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + extension;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private Path getStoragePath(Long patientId, String filename) {
        return Paths.get(storagePath, "patient-" + patientId, filename);
    }

    private void validatePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
    }

    private ClinicalFileResponse mapToResponse(ClinicalFile file) {
        return ClinicalFileResponse.builder()
                .id(file.getId())
                .patientId(file.getPatientId())
                .fileName(file.getFileName())
                .fileType(file.getFileType())
                .mimeType(file.getMimeType())
                .fileSize(file.getFileSize())
                .uploadedBy(file.getUploadedBy())
                .uploadedAt(file.getUploadedAt())
                .build();
    }

    /**
     * Get the internal ClinicalFile entity by ID (for use by other services)
     */
    @Transactional(readOnly = true)
    public ClinicalFile getClinicalFileEntity(Long id) {
        return clinicalFileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinical file not found with id: " + id));
    }
}
