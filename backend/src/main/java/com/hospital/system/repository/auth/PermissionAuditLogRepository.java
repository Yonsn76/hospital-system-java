package com.hospital.system.repository.auth;

import com.hospital.system.model.auth.PermissionAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PermissionAuditLogRepository extends JpaRepository<PermissionAuditLog, Long> {

    // Buscar por rol afectado
    List<PermissionAuditLog> findByTargetRoleOrderByPerformedAtDesc(String role);

    // Buscar por usuario afectado
    List<PermissionAuditLog> findByTargetUsernameOrderByPerformedAtDesc(String username);

    // Buscar por administrador que realizó el cambio
    List<PermissionAuditLog> findByPerformedByOrderByPerformedAtDesc(String username);

    // Buscar por módulo
    List<PermissionAuditLog> findByModuleIdOrderByPerformedAtDesc(String moduleId);

    // Buscar por rango de fechas
    List<PermissionAuditLog> findByPerformedAtBetweenOrderByPerformedAtDesc(
            LocalDateTime start, LocalDateTime end);

    // Obtener los últimos N registros
    List<PermissionAuditLog> findTop50ByOrderByPerformedAtDesc();

    // Buscar con paginación
    Page<PermissionAuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);

    // Buscar por rol o usuario con paginación
    @Query("SELECT p FROM PermissionAuditLog p WHERE " +
            "(:role IS NULL OR p.targetRole = :role) AND " +
            "(:username IS NULL OR p.targetUsername = :username) " +
            "ORDER BY p.performedAt DESC")
    Page<PermissionAuditLog> findByRoleOrUsername(
            @Param("role") String role,
            @Param("username") String username,
            Pageable pageable);
}
