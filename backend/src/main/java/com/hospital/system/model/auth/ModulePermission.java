package com.hospital.system.model.auth;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "module_permissions")
public class ModulePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String role; // DOCTOR, NURSE, RECEPTIONIST

    @Column(name = "username")
    private String username; // null si es permiso de rol

    @Column(name = "module_id", nullable = false)
    private String moduleId;

    @Column(name = "permission_type", nullable = false)
    private String permissionType; // ADDED, REMOVED
}
