package com.hospital.system.security;

import com.hospital.system.model.auth.User;
import com.hospital.system.service.auth.ModulePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Evaluador de permisos basado en módulos.
 * Permite verificar si un usuario tiene acceso a un módulo específico,
 * considerando tanto los permisos por defecto del rol como los permisos
 * dinámicos asignados por el admin.
 */
@Slf4j
@Component("modulePermission")
@RequiredArgsConstructor
public class ModulePermissionEvaluator {

    private final ModulePermissionService permissionService;

    /**
     * Verifica si el usuario actual tiene acceso a un módulo específico.
     * Se usa en @PreAuthorize: @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
     */
    public boolean hasAccess(Authentication authentication, String moduleId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Access denied to module '{}': authentication is null or not authenticated", moduleId);
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            log.warn("Access denied to module '{}': principal is not User instance, it is: {}", 
                    moduleId, principal != null ? principal.getClass().getName() : "null");
            return false;
        }

        User user = (User) principal;
        boolean hasAccess = permissionService.hasModuleAccess(user, moduleId);
        log.debug("User '{}' (role: {}) access to module '{}': {}", 
                user.getUsername(), user.getRole(), moduleId, hasAccess);
        return hasAccess;
    }

    /**
     * Verifica si el usuario tiene acceso a cualquiera de los módulos especificados.
     */
    public boolean hasAnyAccess(Authentication authentication, String... moduleIds) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            return false;
        }

        User user = (User) principal;
        for (String moduleId : moduleIds) {
            if (permissionService.hasModuleAccess(user, moduleId)) {
                return true;
            }
        }
        return false;
    }
}
