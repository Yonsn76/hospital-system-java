package com.hospital.system.service.auth;

import com.hospital.system.dto.auth.ModuleConfigDTO;
import com.hospital.system.dto.auth.ModulePermissionRequest;
import com.hospital.system.dto.auth.ModulePermissionResponse;
import com.hospital.system.dto.auth.PermissionAuditLogResponse;
import com.hospital.system.model.auth.ModulePermission;
import com.hospital.system.model.auth.PermissionAuditLog;
import com.hospital.system.model.auth.User;
import com.hospital.system.repository.auth.ModulePermissionRepository;
import com.hospital.system.repository.auth.PermissionAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ModulePermissionService {

    private final ModulePermissionRepository permissionRepository;
    private PermissionAuditLogRepository auditLogRepository;

    @Autowired
    public ModulePermissionService(ModulePermissionRepository permissionRepository,
            @Autowired(required = false) PermissionAuditLogRepository auditLogRepository) {
        this.permissionRepository = permissionRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // Todos los módulos disponibles en el sistema
    private static final Set<String> ALL_MODULES = Set.of(
            "dashboard", "citas", "calendario", "pacientes", "doctores",
            "historia-clinica", "notas-medicas", "recetas", "examenes",
            "archivos", "hospitalizacion", "gestion-camas", "triage", "enfermeria",
            "referencias", "reportes", "permisos");

    // Permisos por defecto de cada rol (sincronizado con frontend modules.ts)
    private static final Map<String, Set<String>> DEFAULT_ROLE_PERMISSIONS = Map.of(
            "DOCTOR", Set.of("dashboard", "citas", "calendario", "pacientes", "doctores",
                    "historia-clinica", "notas-medicas", "recetas", "examenes", "referencias", "reportes"),
            "NURSE", Set.of("dashboard", "citas", "calendario", "pacientes", "doctores",
                    "historia-clinica", "triage", "enfermeria", "hospitalizacion", "gestion-camas"),
            "RECEPTIONIST", Set.of("dashboard", "citas", "calendario", "pacientes", "doctores"));

    // Configuración completa de módulos (fuente de verdad para frontend)
    private static final List<ModuleConfigDTO> MODULE_CONFIGS = List.of(
            // Principal
            ModuleConfigDTO.builder().id("dashboard").path("/").name("Dashboard").icon("LayoutDashboard")
                    .description("Panel principal con resumen de actividades")
                    .color("linear-gradient(135deg, #22c55e, #16a34a)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST")).category("principal").build(),
            ModuleConfigDTO.builder().id("citas").path("/citas").name("Citas").icon("Clock")
                    .description("Gestión de citas médicas").color("linear-gradient(135deg, #3b82f6, #2563eb)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST")).category("principal").build(),
            ModuleConfigDTO.builder().id("calendario").path("/calendario").name("Calendario").icon("Calendar")
                    .description("Vista de calendario de citas").color("linear-gradient(135deg, #8b5cf6, #7c3aed)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST")).category("principal").build(),
            ModuleConfigDTO.builder().id("pacientes").path("/pacientes").name("Pacientes").icon("Users")
                    .description("Registro y gestión de pacientes").color("linear-gradient(135deg, #06b6d4, #0891b2)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST")).category("principal").build(),
            ModuleConfigDTO.builder().id("doctores").path("/doctores").name("Doctores").icon("Stethoscope")
                    .description("Directorio de médicos").color("linear-gradient(135deg, #10b981, #059669)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST")).category("principal").build(),
            // Clínico
            ModuleConfigDTO.builder().id("historia-clinica").path("/historia-clinica").name("Historia Clínica")
                    .icon("FileText")
                    .description("Historiales médicos de pacientes").color("linear-gradient(135deg, #f59e0b, #d97706)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR", "NURSE")).category("clinico").build(),
            ModuleConfigDTO.builder().id("notas-medicas").path("/notas-medicas").name("Notas Médicas")
                    .icon("ClipboardList")
                    .description("Notas y observaciones médicas").color("linear-gradient(135deg, #ec4899, #db2777)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR")).category("clinico").build(),
            ModuleConfigDTO.builder().id("recetas").path("/prescripciones").name("Prescripciones").icon("Pill")
                    .description("Recetas y medicamentos").color("linear-gradient(135deg, #ef4444, #dc2626)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR")).category("clinico").build(),
            ModuleConfigDTO.builder().id("examenes").path("/laboratorio").name("Laboratorio").icon("FlaskConical")
                    .description("Exámenes de laboratorio").color("linear-gradient(135deg, #14b8a6, #0d9488)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR")).category("clinico").build(),
            ModuleConfigDTO.builder().id("triage").path("/triaje").name("Triaje").icon("HeartPulse")
                    .description("Evaluación inicial de pacientes").color("linear-gradient(135deg, #f43f5e, #e11d48)")
                    .defaultRoles(List.of("ADMIN", "NURSE")).category("clinico").build(),
            ModuleConfigDTO.builder().id("referencias").path("/derivaciones").name("Derivaciones").icon("Send")
                    .description("Referencias a especialistas").color("linear-gradient(135deg, #6366f1, #4f46e5)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR")).category("clinico").build(),
            // Administrativo
            ModuleConfigDTO.builder().id("archivos").path("/archivos-clinicos").name("Archivos Clínicos")
                    .icon("FolderOpen")
                    .description("Documentos y archivos médicos").color("linear-gradient(135deg, #84cc16, #65a30d)")
                    .defaultRoles(List.of("ADMIN")).category("administrativo").build(),
            ModuleConfigDTO.builder().id("hospitalizacion").path("/hospitalizacion").name("Hospitalización")
                    .icon("Building2")
                    .description("Gestión de pacientes hospitalizados")
                    .color("linear-gradient(135deg, #0ea5e9, #0284c7)")
                    .defaultRoles(List.of("ADMIN", "NURSE")).category("administrativo").build(),
            ModuleConfigDTO.builder().id("gestion-camas").path("/gestion-camas").name("Gestión de Camas")
                    .icon("BedDouble")
                    .description("Administración de camas hospitalarias")
                    .color("linear-gradient(135deg, #a855f7, #9333ea)")
                    .defaultRoles(List.of("ADMIN", "NURSE")).category("administrativo").build(),
            ModuleConfigDTO.builder().id("enfermeria").path("/enfermeria").name("Enfermería").icon("HeartPulse")
                    .description("Signos vitales y observaciones").color("linear-gradient(135deg, #f472b6, #ec4899)")
                    .defaultRoles(List.of("ADMIN", "NURSE")).category("clinico").build(),
            // Reportes
            ModuleConfigDTO.builder().id("reportes").path("/reportes").name("Reportes").icon("BarChart3")
                    .description("Estadísticas y reportes").color("linear-gradient(135deg, #64748b, #475569)")
                    .defaultRoles(List.of("ADMIN", "DOCTOR")).category("reportes").build(),
            // Administración
            ModuleConfigDTO.builder().id("permisos").path("/configuracion/accesos").name("Gestión de Accesos")
                    .icon("Shield")
                    .description("Configurar permisos de usuarios y roles")
                    .color("linear-gradient(135deg, #ef4444, #dc2626)")
                    .defaultRoles(List.of("ADMIN")).category("administrativo").build());

    // Mapeo de módulos a los endpoints/recursos que requieren
    private static final Map<String, Set<String>> MODULE_API_MAPPINGS = Map.ofEntries(
            Map.entry("historia-clinica",
                    Set.of("patients", "doctors", "clinical-history", "allergies", "chronic-diseases", "evolutions")),
            Map.entry("citas", Set.of("appointments", "patients", "doctors")),
            Map.entry("pacientes", Set.of("patients")),
            Map.entry("recetas", Set.of("prescriptions", "patients", "doctors")),
            Map.entry("examenes", Set.of("lab-exams", "patients", "doctors")),
            Map.entry("hospitalizacion", Set.of("hospitalizations", "beds", "patients")),
            Map.entry("triage", Set.of("triage", "patients")),
            Map.entry("enfermeria", Set.of("vital-signs", "nursing-observations", "patients")),
            Map.entry("archivos", Set.of("clinical-files", "patients")),
            Map.entry("reportes", Set.of("reports")),
            Map.entry("usuarios", Set.of("users")),
            Map.entry("permisos", Set.of("permissions")),
            Map.entry("referencias", Set.of("referrals", "patients", "doctors")));

    // ===== Métodos de verificación de acceso =====

    /**
     * Verifica si un usuario tiene acceso a un módulo específico.
     * 
     * Lógica de permisos:
     * 1. ADMIN siempre tiene acceso
     * 2. Si hay permiso específico del usuario:
     * - ADDED = acceso concedido
     * - REMOVED = acceso denegado (override de defaults)
     * 3. Si hay permiso específico del rol:
     * - ADDED = acceso concedido
     * - REMOVED = acceso denegado (override de defaults)
     * 4. Si no hay permisos específicos, usar defaults del rol
     */
    public boolean hasModuleAccess(User user, String moduleId) {
        if (user == null || moduleId == null) {
            log.warn("hasModuleAccess: user or moduleId is null");
            return false;
        }

        String role = user.getRole().name();
        String username = user.getUsername();

        log.debug("Checking access for user '{}' (role: {}) to module '{}'", username, role, moduleId);

        // Admin siempre tiene acceso
        if ("ADMIN".equals(role)) {
            log.debug("User '{}' is ADMIN, granting access to '{}'", username, moduleId);
            return true;
        }

        // Verificar permisos específicos del usuario (tienen prioridad máxima)
        Optional<ModulePermission> userPermission = permissionRepository
                .findByUsernameAndModuleId(username, moduleId);

        if (userPermission.isPresent()) {
            String permType = userPermission.get().getPermissionType();
            boolean hasAccess = "ADDED".equals(permType);
            log.debug("Found user-specific permission for '{}' to '{}': type={}, access={}",
                    username, moduleId, permType, hasAccess);
            return hasAccess;
        }

        // Verificar permisos del rol (modificaciones del admin al rol)
        Optional<ModulePermission> rolePermission = permissionRepository
                .findByRoleAndModuleIdAndUsernameIsNull(role, moduleId);

        if (rolePermission.isPresent()) {
            String permType = rolePermission.get().getPermissionType();
            boolean hasAccess = "ADDED".equals(permType);
            log.debug("Found role permission for role '{}' to '{}': type={}, access={}",
                    role, moduleId, permType, hasAccess);
            return hasAccess;
        }

        // Si no hay permiso específico, usar permisos por defecto del rol
        boolean defaultAccess = hasDefaultRoleAccess(role, moduleId);
        log.debug("Using default role access for '{}' (role: {}) to '{}': {}",
                username, role, moduleId, defaultAccess);
        return defaultAccess;
    }

    /**
     * Verifica si un usuario tiene acceso a un recurso API basado en sus permisos
     * de módulos
     */
    public boolean hasApiResourceAccess(User user, String resource) {
        if (user == null || resource == null) {
            return false;
        }

        // Admin siempre tiene acceso
        if ("ADMIN".equals(user.getRole().name())) {
            return true;
        }

        // Buscar qué módulos requieren este recurso
        for (Map.Entry<String, Set<String>> entry : MODULE_API_MAPPINGS.entrySet()) {
            if (entry.getValue().contains(resource)) {
                if (hasModuleAccess(user, entry.getKey())) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Permisos por defecto según el rol
     */
    public boolean hasDefaultRoleAccess(String role, String moduleId) {
        Set<String> roleModules = DEFAULT_ROLE_PERMISSIONS.get(role);
        return roleModules != null && roleModules.contains(moduleId);
    }

    /**
     * Obtiene todos los módulos disponibles en el sistema
     */
    public Set<String> getAllAvailableModules() {
        return new HashSet<>(ALL_MODULES);
    }

    /**
     * Obtiene la configuración completa de todos los módulos
     */
    public List<ModuleConfigDTO> getAllModuleConfigs() {
        return new ArrayList<>(MODULE_CONFIGS);
    }

    /**
     * Obtiene los módulos accesibles para un usuario con su configuración completa
     */
    public List<ModuleConfigDTO> getAccessibleModuleConfigs(User user) {
        Set<String> accessibleIds = getAccessibleModules(user);
        return MODULE_CONFIGS.stream()
                .filter(config -> accessibleIds.contains(config.getId()))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los permisos por defecto de un rol
     */
    public Set<String> getDefaultPermissionsForRole(String role) {
        Set<String> defaults = DEFAULT_ROLE_PERMISSIONS.get(role);
        return defaults != null ? new HashSet<>(defaults) : Collections.emptySet();
    }

    /**
     * Obtiene todos los módulos accesibles para un usuario
     */
    public Set<String> getAccessibleModules(User user) {
        if (user == null) {
            return Collections.emptySet();
        }

        // Admin tiene acceso a todo
        if ("ADMIN".equals(user.getRole().name())) {
            return new HashSet<>(ALL_MODULES);
        }

        Set<String> accessibleModules = new HashSet<>();
        String role = user.getRole().name();
        String username = user.getUsername();

        // Agregar módulos por defecto del rol
        Set<String> roleDefaults = DEFAULT_ROLE_PERMISSIONS.get(role);
        if (roleDefaults != null) {
            accessibleModules.addAll(roleDefaults);
        }

        // Aplicar permisos del rol (modificaciones del admin)
        List<ModulePermission> rolePermissions = permissionRepository.findByRoleAndUsernameIsNull(role);
        for (ModulePermission perm : rolePermissions) {
            if ("ADDED".equals(perm.getPermissionType())) {
                accessibleModules.add(perm.getModuleId());
            } else if ("REMOVED".equals(perm.getPermissionType())) {
                accessibleModules.remove(perm.getModuleId());
            }
        }

        // Aplicar permisos específicos del usuario (tienen prioridad sobre el rol)
        List<ModulePermission> userPermissions = permissionRepository.findByUsername(username);
        for (ModulePermission perm : userPermissions) {
            if ("ADDED".equals(perm.getPermissionType())) {
                accessibleModules.add(perm.getModuleId());
            } else if ("REMOVED".equals(perm.getPermissionType())) {
                accessibleModules.remove(perm.getModuleId());
            }
        }

        return accessibleModules;
    }

    // ===== Métodos de lectura de permisos =====

    public List<ModulePermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ModulePermissionResponse> getPermissionsByRole(String role) {
        return permissionRepository.findByRoleAndUsernameIsNull(role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ModulePermissionResponse> getPermissionsByUsername(String username) {
        return permissionRepository.findByUsername(username).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ===== Métodos de creación/actualización con validación =====

    /**
     * Crea o actualiza un permiso con validación inteligente.
     * Evita crear permisos redundantes (ej: ADDED para módulos ya por defecto).
     */
    @Transactional
    public ModulePermissionResponse createOrUpdatePermission(ModulePermissionRequest request, String performedBy) {
        String role = request.getRole();
        String moduleId = request.getModuleId();
        String username = request.getUsername();
        String permissionType = request.getPermissionType();

        // Validar que el módulo existe
        if (!ALL_MODULES.contains(moduleId)) {
            throw new IllegalArgumentException("Módulo no válido: " + moduleId);
        }

        // Validar tipo de permiso
        if (!"ADDED".equals(permissionType) && !"REMOVED".equals(permissionType)) {
            throw new IllegalArgumentException("Tipo de permiso no válido: " + permissionType);
        }

        boolean isUserPermission = username != null && !username.isEmpty();
        boolean isDefaultForRole = hasDefaultRoleAccess(role, moduleId);

        // Validación inteligente para evitar permisos redundantes
        if (!isUserPermission) {
            // Permiso de rol
            if ("ADDED".equals(permissionType) && isDefaultForRole) {
                // Intentando agregar un módulo que ya es por defecto - verificar si hay REMOVED
                // existente
                Optional<ModulePermission> existing = permissionRepository
                        .findByRoleAndModuleIdAndUsernameIsNull(role, moduleId);
                if (existing.isEmpty()) {
                    log.info("Ignoring redundant ADDED permission for default module '{}' on role '{}'",
                            moduleId, role);
                    // Retornar un response indicando que no hay cambios
                    return ModulePermissionResponse.builder()
                            .role(role)
                            .moduleId(moduleId)
                            .permissionType("DEFAULT")
                            .build();
                }
                // Si existe un REMOVED, eliminarlo en lugar de crear ADDED
                permissionRepository.delete(existing.get());
                logAuditAction("DELETED", role, null, moduleId, "REMOVED", null, performedBy,
                        "Restaurado a valor por defecto (eliminado REMOVED)");
                return ModulePermissionResponse.builder()
                        .role(role)
                        .moduleId(moduleId)
                        .permissionType("DEFAULT")
                        .build();
            }
        } else {
            // Permiso de usuario - verificar si realmente es necesario
            boolean hasRoleAccess = hasModuleAccess(
                    User.builder().username(username).role(com.hospital.system.model.auth.Role.valueOf(role)).build(),
                    moduleId);

            // Solo consideramos permisos de rol, no de usuario para esta verificación
            Optional<ModulePermission> existingUserPerm = permissionRepository.findByUsernameAndModuleId(username,
                    moduleId);
            if (existingUserPerm.isEmpty()) {
                // No hay permiso de usuario, verificar si el cambio es necesario
                if ("ADDED".equals(permissionType) && hasRoleAccess) {
                    log.info(
                            "Ignoring redundant ADDED permission for user '{}' on module '{}' (already has access via role)",
                            username, moduleId);
                    return ModulePermissionResponse.builder()
                            .username(username)
                            .role(role)
                            .moduleId(moduleId)
                            .permissionType("INHERITED")
                            .build();
                }
            }
        }

        Optional<ModulePermission> existingPermission;
        String previousType = null;

        if (isUserPermission) {
            existingPermission = permissionRepository.findByUsernameAndModuleId(username, moduleId);
        } else {
            existingPermission = permissionRepository.findByRoleAndModuleIdAndUsernameIsNull(role, moduleId);
        }

        ModulePermission permission;
        String action;

        if (existingPermission.isPresent()) {
            permission = existingPermission.get();
            previousType = permission.getPermissionType();

            // Si el tipo es el mismo, no hay cambios
            if (previousType.equals(permissionType)) {
                log.info("Permission already exists with same type, no changes needed");
                return mapToResponse(permission);
            }

            permission.setPermissionType(permissionType);
            action = "UPDATED";
        } else {
            permission = ModulePermission.builder()
                    .role(role)
                    .username(isUserPermission ? username : null)
                    .moduleId(moduleId)
                    .permissionType(permissionType)
                    .build();
            action = "CREATED";
        }

        ModulePermission savedPermission = permissionRepository.save(permission);

        // Registrar en auditoría
        logAuditAction(action, role, isUserPermission ? username : null, moduleId,
                permissionType, previousType, performedBy, null);

        log.info("Permission {} for {} on module '{}': {} -> {}",
                action, isUserPermission ? "user " + username : "role " + role,
                moduleId, previousType, permissionType);

        return mapToResponse(savedPermission);
    }

    /**
     * Sobrecarga para compatibilidad - sin auditoría detallada
     */
    @Transactional
    public ModulePermissionResponse createOrUpdatePermission(ModulePermissionRequest request) {
        return createOrUpdatePermission(request, "SYSTEM");
    }

    // ===== Métodos de eliminación =====

    @Transactional
    public void deletePermission(Long id) {
        Optional<ModulePermission> permission = permissionRepository.findById(id);
        if (permission.isEmpty()) {
            throw new RuntimeException("Permission not found");
        }

        ModulePermission perm = permission.get();
        permissionRepository.deleteById(id);

        log.info("Deleted permission {} for {} on module '{}'",
                perm.getId(),
                perm.getUsername() != null ? "user " + perm.getUsername() : "role " + perm.getRole(),
                perm.getModuleId());
    }

    @Transactional
    public void deletePermission(Long id, String performedBy) {
        Optional<ModulePermission> permission = permissionRepository.findById(id);
        if (permission.isEmpty()) {
            throw new RuntimeException("Permission not found");
        }

        ModulePermission perm = permission.get();

        // Registrar en auditoría
        logAuditAction("DELETED", perm.getRole(), perm.getUsername(), perm.getModuleId(),
                perm.getPermissionType(), null, performedBy, null);

        permissionRepository.deleteById(id);
    }

    @Transactional
    public void deletePermissionByRoleAndModule(String role, String moduleId) {
        permissionRepository.deleteByRoleAndModuleIdAndUsernameIsNull(role, moduleId);
        log.info("Deleted permission for role '{}' on module '{}'", role, moduleId);
    }

    @Transactional
    public void deletePermissionByUsernameAndModule(String username, String moduleId) {
        permissionRepository.deleteByUsernameAndModuleId(username, moduleId);
        log.info("Deleted permission for user '{}' on module '{}'", username, moduleId);
    }

    // ===== Métodos de reset batch =====

    /**
     * Elimina todos los permisos personalizados de un rol, volviendo a defaults.
     * Usa operación batch para mejor rendimiento.
     */
    @Transactional
    public int resetRolePermissions(String role, String performedBy) {
        long count = permissionRepository.countByRoleAndUsernameIsNull(role);
        if (count == 0) {
            log.info("No custom permissions to reset for role '{}'", role);
            return 0;
        }

        int deleted = permissionRepository.deleteAllByRoleAndUsernameIsNull(role);

        // Registrar en auditoría
        logAuditAction("RESET_ROLE", role, null, null, null, null, performedBy,
                "Reset " + deleted + " permisos del rol " + role);

        log.info("Reset {} custom permissions for role '{}' by {}", deleted, role, performedBy);
        return deleted;
    }

    /**
     * Elimina todos los permisos personalizados de un usuario.
     * Usa operación batch para mejor rendimiento.
     */
    @Transactional
    public int resetUserPermissions(String username, String performedBy) {
        long count = permissionRepository.countByUsername(username);
        if (count == 0) {
            log.info("No custom permissions to reset for user '{}'", username);
            return 0;
        }

        int deleted = permissionRepository.deleteAllByUsername(username);

        // Registrar en auditoría
        logAuditAction("RESET_USER", null, username, null, null, null, performedBy,
                "Reset " + deleted + " permisos del usuario " + username);

        log.info("Reset {} custom permissions for user '{}' by {}", deleted, username, performedBy);
        return deleted;
    }

    /**
     * Elimina todos los permisos personalizados, volviendo a los defaults
     */
    @Transactional
    public int resetAllPermissions(String performedBy) {
        long count = permissionRepository.count();
        if (count == 0) {
            log.info("No custom permissions to reset");
            return 0;
        }

        permissionRepository.deleteAll();

        // Registrar en auditoría
        logAuditAction("RESET_ALL", null, null, null, null, null, performedBy,
                "Reset " + count + " permisos totales");

        log.info("Reset {} total custom permissions by {}", count, performedBy);
        return (int) count;
    }

    /**
     * Sobrecarga para compatibilidad
     */
    @Transactional
    public void resetAllPermissions() {
        resetAllPermissions("SYSTEM");
    }

    // ===== Métodos de auditoría =====

    /**
     * Registra una acción en el log de auditoría
     */
    private void logAuditAction(String action, String targetRole, String targetUsername,
            String moduleId, String permissionType, String previousType,
            String performedBy, String description) {
        if (auditLogRepository == null) {
            log.debug("Audit log repository not available, skipping audit");
            return;
        }
        try {
            PermissionAuditLog auditLog = PermissionAuditLog.builder()
                    .action(action)
                    .targetRole(targetRole)
                    .targetUsername(targetUsername)
                    .moduleId(moduleId)
                    .permissionType(permissionType)
                    .previousPermissionType(previousType)
                    .performedBy(performedBy)
                    .performedAt(LocalDateTime.now())
                    .description(description)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Error saving audit log: {}", e.getMessage());
        }
    }

    /**
     * Obtiene los últimos registros de auditoría
     */
    public List<PermissionAuditLogResponse> getRecentAuditLogs() {
        if (auditLogRepository == null) {
            return Collections.emptyList();
        }
        return auditLogRepository.findTop50ByOrderByPerformedAtDesc().stream()
                .map(this::mapAuditToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene registros de auditoría con paginación
     */
    public Page<PermissionAuditLogResponse> getAuditLogs(Pageable pageable) {
        if (auditLogRepository == null) {
            return Page.empty();
        }
        return auditLogRepository.findAllByOrderByPerformedAtDesc(pageable)
                .map(this::mapAuditToResponse);
    }

    /**
     * Obtiene registros de auditoría filtrados por rol
     */
    public List<PermissionAuditLogResponse> getAuditLogsByRole(String role) {
        if (auditLogRepository == null) {
            return Collections.emptyList();
        }
        return auditLogRepository.findByTargetRoleOrderByPerformedAtDesc(role).stream()
                .map(this::mapAuditToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene registros de auditoría filtrados por usuario
     */
    public List<PermissionAuditLogResponse> getAuditLogsByUsername(String username) {
        if (auditLogRepository == null) {
            return Collections.emptyList();
        }
        return auditLogRepository.findByTargetUsernameOrderByPerformedAtDesc(username).stream()
                .map(this::mapAuditToResponse)
                .collect(Collectors.toList());
    }

    // ===== Mappers =====

    private ModulePermissionResponse mapToResponse(ModulePermission permission) {
        return ModulePermissionResponse.builder()
                .id(permission.getId())
                .role(permission.getRole())
                .username(permission.getUsername())
                .moduleId(permission.getModuleId())
                .permissionType(permission.getPermissionType())
                .build();
    }

    private PermissionAuditLogResponse mapAuditToResponse(PermissionAuditLog log) {
        return PermissionAuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .targetRole(log.getTargetRole())
                .targetUsername(log.getTargetUsername())
                .moduleId(log.getModuleId())
                .permissionType(log.getPermissionType())
                .previousPermissionType(log.getPreviousPermissionType())
                .performedBy(log.getPerformedBy())
                .performedAt(log.getPerformedAt())
                .description(log.getDescription())
                .build();
    }
}
