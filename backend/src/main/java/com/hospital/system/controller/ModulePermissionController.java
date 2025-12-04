package com.hospital.system.controller;

import com.hospital.system.dto.ModulePermissionRequest;
import com.hospital.system.dto.ModulePermissionResponse;
import com.hospital.system.model.User;
import com.hospital.system.service.ModulePermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class ModulePermissionController {

    private final ModulePermissionService permissionService;

    // Endpoint para que cualquier usuario autenticado obtenga sus permisos
    @GetMapping("/my-permissions")
    public ResponseEntity<List<ModulePermissionResponse>> getMyPermissions(@AuthenticationPrincipal User user) {
        List<ModulePermissionResponse> permissions = new ArrayList<>();
        // Obtener permisos del rol del usuario
        permissions.addAll(permissionService.getPermissionsByRole(user.getRole().name()));
        // Obtener permisos personalizados del usuario
        permissions.addAll(permissionService.getPermissionsByUsername(user.getUsername()));
        return ResponseEntity.ok(permissions);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModulePermissionResponse>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModulePermissionResponse>> getPermissionsByRole(@PathVariable String role) {
        return ResponseEntity.ok(permissionService.getPermissionsByRole(role));
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModulePermissionResponse>> getPermissionsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(permissionService.getPermissionsByUsername(username));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ModulePermissionResponse> createOrUpdatePermission(@RequestBody ModulePermissionRequest request) {
        return ResponseEntity.ok(permissionService.createOrUpdatePermission(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/role/{role}/module/{moduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermissionByRoleAndModule(
            @PathVariable String role, 
            @PathVariable String moduleId) {
        permissionService.deletePermissionByRoleAndModule(role, moduleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{username}/module/{moduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePermissionByUsernameAndModule(
            @PathVariable String username, 
            @PathVariable String moduleId) {
        permissionService.deletePermissionByUsernameAndModule(username, moduleId);
        return ResponseEntity.noContent().build();
    }
}
