package com.hospital.system.dto.auth;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionAuditLogResponse {
    private Long id;
    private String action;
    private String targetRole;
    private String targetUsername;
    private String moduleId;
    private String permissionType;
    private String previousPermissionType;
    private String performedBy;
    private LocalDateTime performedAt;
    private String description;
}
