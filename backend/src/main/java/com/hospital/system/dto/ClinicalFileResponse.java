package com.hospital.system.dto;

import com.hospital.system.model.FileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicalFileResponse {
    private Long id;
    private Long patientId;
    private String fileName;
    private FileType fileType;
    private String mimeType;
    private Long fileSize;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
}
