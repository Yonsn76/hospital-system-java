package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModulePermissionRequest {
    
    private String role;
    private String username;
    private String moduleId;
    private String permissionType; // ADDED, REMOVED
}
