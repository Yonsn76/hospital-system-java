package com.hospital.system.controller.auth;

import com.hospital.system.dto.auth.ModulePermissionRequest;
import com.hospital.system.dto.auth.ModulePermissionResponse;
import com.hospital.system.dto.auth.PermissionAuditLogResponse;
import com.hospital.system.model.auth.User;
import com.hospital.system.service.auth.ModulePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class ModulePermissionController {

    private final ModulePermissionService permissionService;

    // ===== Endpoints para usuarios autenticados =====

    /**
     * Obtiene los permisos del usuario actual
     */
    @GetMapping("/my-permissions")
    public ResponseEntity<List<ModulePermissionResponse>> getMyPermissions(@AuthenticationPrincipal User user) {
        List<ModulePermissionResponse> permissions = new ArrayList<>();
        // Obtener permisos del rol del usuario
        permissions.addAll(permissionService.getPermissionsByRole(user.getRole().name()));
        // Obtener permisos personalizados del usuario
        permissions.addAll(permissionService.getPermissionsByUsername(user.getUsername()));
        return ResponseEntity.ok(permissions);
    }

    /**
     * Obtiene los módulos accesibles del usuario actual
     */
    @GetMapping("/my-modules")
    public ResponseEntity<java.util.Set<String>> getMyAccessibleModules(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(permissionService.getAccessibleModules(user));
    }

    /**
     * Verifica si el usuario actual tiene acceso a un módulo específico
     */
    @GetMapping("/check/{moduleId}")
    public ResponseEntity<Boolean> checkModuleAccess(
            @AuthenticationPrincipal User user,
            @PathVariable String moduleId) {
        return ResponseEntity.ok(permissionService.hasModuleAccess(user, moduleId));
    }

    /**
     * Obtiene los módulos accesibles del usuario con configuración completa
     */
    @GetMapping("/my-module-configs")
    public ResponseEntity<java.util.List<com.hospital.system.dto.auth.ModuleConfigDTO>> getMyAccessibleModuleConfigs(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(permissionService.getAccessibleModuleConfigs(user));
    }

    // ===== Endpoints de lectura (solo ADMIN) =====

    /**
     * Obtiene todos los módulos disponibles en el sistema
     */
    @GetMapping("/available-modules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Set<String>> getAvailableModules() {
        return ResponseEntity.ok(permissionService.getAllAvailableModules());
    }

    /**
     * Obtiene los permisos por defecto de un rol
     */
    @GetMapping("/defaults/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Set<String>> getDefaultPermissionsForRole(@PathVariable String role) {
        return ResponseEntity.ok(permissionService.getDefaultPermissionsForRole(role));
    }

    /**
     * Obtiene la configuración completa de todos los módulos
     */
    @GetMapping("/module-configs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<com.hospital.system.dto.auth.ModuleConfigDTO>> getAllModuleConfigs() {
        return ResponseEntity.ok(permissionService.getAllModuleConfigs());
    }

    /**
     * Obtiene todos los permisos personalizados
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModulePermissionResponse>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    /**
     * Obtiene permisos de un rol específico
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModulePermissionResponse>> getPermissionsByRole(@PathVariable String role) {
        return ResponseEntity.ok(permissionService.getPermissionsByRole(role));
    }

    /**
     * Obtiene permisos de un usuario específico
     */
    @GetMapping("/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModulePermissionResponse>> getPermissionsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(permissionService.getPermissionsByUsername(username));
    }

    // ===== Endpoints de modificación (solo ADMIN) =====

    /**
     * Crea o actualiza un permiso con validación inteligente
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModulePermissionResponse> createOrUpdatePermission(
            @RequestBody ModulePermissionRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(permissionService.createOrUpdatePermission(request, admin.getUsername()));
    }

    /**
     * Elimina un permiso por ID
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermission(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        permissionService.deletePermission(id, admin.getUsername());
        return ResponseEntity.noContent().build();
    }

    /**
     * Elimina un permiso de rol para un módulo específico
     */
    @DeleteMapping("/role/{role}/module/{moduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermissionByRoleAndModule(
            @PathVariable String role,
            @PathVariable String moduleId) {
        permissionService.deletePermissionByRoleAndModule(role, moduleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Elimina un permiso de usuario para un módulo específico
     */
    @DeleteMapping("/user/{username}/module/{moduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermissionByUsernameAndModule(
            @PathVariable String username,
            @PathVariable String moduleId) {
        permissionService.deletePermissionByUsernameAndModule(username, moduleId);
        return ResponseEntity.noContent().build();
    }

    // ===== Endpoints de reset batch (solo ADMIN) =====

    /**
     * Resetea todos los permisos personalizados de un rol (batch)
     */
    @DeleteMapping("/reset/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> resetRolePermissions(
            @PathVariable String role,
            @AuthenticationPrincipal User admin) {
        int deleted = permissionService.resetRolePermissions(role, admin.getUsername());
        return ResponseEntity.ok(Map.of(
                "message", "Permisos del rol restaurados",
                "role", role,
                "deletedCount", deleted));
    }

    /**
     * Resetea todos los permisos personalizados de un usuario (batch)
     */
    @DeleteMapping("/reset/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> resetUserPermissions(
            @PathVariable String username,
            @AuthenticationPrincipal User admin) {
        int deleted = permissionService.resetUserPermissions(username, admin.getUsername());
        return ResponseEntity.ok(Map.of(
                "message", "Permisos del usuario restaurados",
                "username", username,
                "deletedCount", deleted));
    }

    /**
     * Resetea todos los permisos personalizados del sistema (batch)
     */
    @DeleteMapping("/reset-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> resetAllPermissions(@AuthenticationPrincipal User admin) {
        int deleted = permissionService.resetAllPermissions(admin.getUsername());
        return ResponseEntity.ok(Map.of(
                "message", "Todos los permisos restaurados",
                "deletedCount", deleted));
    }

    // ===== Endpoints de auditoría (solo ADMIN) =====

    /**
     * Obtiene los últimos 50 registros de auditoría
     */
    @GetMapping("/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PermissionAuditLogResponse>> getRecentAuditLogs() {
        return ResponseEntity.ok(permissionService.getRecentAuditLogs());
    }

    /**
     * Obtiene registros de auditoría con paginación
     */
    @GetMapping("/audit/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PermissionAuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(permissionService.getAuditLogs(PageRequest.of(page, size)));
    }

    /**
     * Obtiene registros de auditoría filtrados por rol
     */
    @GetMapping("/audit/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PermissionAuditLogResponse>> getAuditLogsByRole(@PathVariable String role) {
        return ResponseEntity.ok(permissionService.getAuditLogsByRole(role));
    }

    /**
     * Obtiene registros de auditoría filtrados por usuario
     */
    @GetMapping("/audit/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PermissionAuditLogResponse>> getAuditLogsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(permissionService.getAuditLogsByUsername(username));
    }
}
