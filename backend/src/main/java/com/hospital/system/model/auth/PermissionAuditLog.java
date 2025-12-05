package com.hospital.system.model.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad para registrar cambios en permisos de módulos.
 * Mantiene un historial de quién modificó qué permisos y cuándo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "permission_audit_logs")
public class PermissionAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action", nullable = false)
    private String action; // CREATED, UPDATED, DELETED, RESET_ROLE, RESET_USER, RESET_ALL

    @Column(name = "target_role")
    private String targetRole; // Rol afectado

    @Column(name = "target_username")
    private String targetUsername; // Usuario afectado (null si es permiso de rol)

    @Column(name = "module_id")
    private String moduleId; // Módulo afectado

    @Column(name = "permission_type")
    private String permissionType; // ADDED, REMOVED (el tipo de permiso)

    @Column(name = "previous_permission_type")
    private String previousPermissionType; // Valor anterior (para updates)

    @Column(name = "performed_by", nullable = false)
    private String performedBy; // Username del admin que realizó el cambio

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @Column(name = "description")
    private String description; // Descripción adicional del cambio
}
