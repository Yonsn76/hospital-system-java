package com.hospital.system.dto.files;

import com.hospital.system.model.auth.AccessAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FileAccessLogResponse {
    private Long id;
    private Long clinicalFileId;
    private Long userId;
    private AccessAction action;
    private LocalDateTime accessedAt;
    private String ipAddress;
}
