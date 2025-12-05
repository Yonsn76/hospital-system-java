package com.hospital.system.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleConfigDTO {
    private String id;
    private String path;
    private String name;
    private String icon;
    private String description;
    private String color;
    private List<String> defaultRoles; // Roles que tienen acceso por defecto
    private String category;
}
