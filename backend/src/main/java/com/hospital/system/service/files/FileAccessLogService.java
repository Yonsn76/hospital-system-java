package com.hospital.system.service.files;

import com.hospital.system.dto.files.FileAccessLogResponse;
import com.hospital.system.model.auth.AccessAction;
import com.hospital.system.model.files.FileAccessLog;
import com.hospital.system.repository.files.ClinicalFileRepository;
import com.hospital.system.repository.files.FileAccessLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing file access audit logs.
 * Implements audit logging for file access as per Requirements 6.4
 */
@Service
@RequiredArgsConstructor
public class FileAccessLogService {

    private final FileAccessLogRepository fileAccessLogRepository;
    private final ClinicalFileRepository clinicalFileRepository;

    /**
     * Logs a file access event (VIEW or DOWNLOAD)
     * Creates an audit trail entry with user ID, file ID, action type, timestamp, and IP address
     * 
     * @param clinicalFileId The ID of the clinical file being accessed
     * @param userId The ID of the user accessing the file
     * @param action The type of access (VIEW or DOWNLOAD)
     * @param ipAddress The IP address of the user
     * @return The created FileAccessLogResponse
     */
    @Transactional
    public FileAccessLogResponse logAccess(Long clinicalFileId, Long userId, AccessAction action, String ipAddress) {
        validateFileExists(clinicalFileId);

        FileAccessLog accessLog = FileAccessLog.builder()
                .clinicalFileId(clinicalFileId)
                .userId(userId)
                .action(action)
                .ipAddress(ipAddress)
                .build();

        FileAccessLog savedLog = fileAccessLogRepository.save(accessLog);
        return mapToResponse(savedLog);
    }

    /**
     * Gets all access logs for a specific clinical file
     */
    @Transactional(readOnly = true)
    public List<FileAccessLogResponse> getAccessLogsByFile(Long clinicalFileId) {
        validateFileExists(clinicalFileId);
        return fileAccessLogRepository.findByClinicalFileIdOrderByAccessedAtDesc(clinicalFileId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Gets all access logs for a specific user
     */
    @Transactional(readOnly = true)
    public List<FileAccessLogResponse> getAccessLogsByUser(Long userId) {
        return fileAccessLogRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Gets access logs filtered by action type (VIEW or DOWNLOAD)
     */
    @Transactional(readOnly = true)
    public List<FileAccessLogResponse> getAccessLogsByFileAndAction(Long clinicalFileId, AccessAction action) {
        validateFileExists(clinicalFileId);
        return fileAccessLogRepository.findByClinicalFileIdAndAction(clinicalFileId, action)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Gets access logs within a date range (for audit reports)
     */
    @Transactional(readOnly = true)
    public List<FileAccessLogResponse> getAccessLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return fileAccessLogRepository.findByAccessedAtBetween(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateFileExists(Long clinicalFileId) {
        if (!clinicalFileRepository.existsById(clinicalFileId)) {
            throw new RuntimeException("Clinical file not found with id: " + clinicalFileId);
        }
    }

    private FileAccessLogResponse mapToResponse(FileAccessLog log) {
        return FileAccessLogResponse.builder()
                .id(log.getId())
                .clinicalFileId(log.getClinicalFileId())
                .userId(log.getUserId())
                .action(log.getAction())
                .accessedAt(log.getAccessedAt())
                .ipAddress(log.getIpAddress())
                .build();
    }
}
