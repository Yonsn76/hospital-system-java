package com.hospital.system.service;

import com.hospital.system.dto.ModulePermissionRequest;
import com.hospital.system.dto.ModulePermissionResponse;
import com.hospital.system.model.ModulePermission;
import com.hospital.system.repository.ModulePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModulePermissionService {

    private final ModulePermissionRepository permissionRepository;

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

    @Transactional
    public ModulePermissionResponse createOrUpdatePermission(ModulePermissionRequest request) {
        Optional<ModulePermission> existingPermission;
        
        if (request.getUsername() != null && !request.getUsername().isEmpty()) {
            existingPermission = permissionRepository.findByUsernameAndModuleId(
                    request.getUsername(), request.getModuleId());
        } else {
            existingPermission = permissionRepository.findByRoleAndModuleIdAndUsernameIsNull(
                    request.getRole(), request.getModuleId());
        }

        ModulePermission permission;
        if (existingPermission.isPresent()) {
            permission = existingPermission.get();
            permission.setPermissionType(request.getPermissionType());
        } else {
            permission = ModulePermission.builder()
                    .role(request.getRole())
                    .username(request.getUsername() != null && !request.getUsername().isEmpty() 
                            ? request.getUsername() : null)
                    .moduleId(request.getModuleId())
                    .permissionType(request.getPermissionType())
                    .build();
        }

        ModulePermission savedPermission = permissionRepository.save(permission);
        return mapToResponse(savedPermission);
    }

    @Transactional
    public void deletePermission(Long id) {
        if (!permissionRepository.existsById(id)) {
            throw new RuntimeException("Permission not found");
        }
        permissionRepository.deleteById(id);
    }

    @Transactional
    public void deletePermissionByRoleAndModule(String role, String moduleId) {
        permissionRepository.deleteByRoleAndModuleIdAndUsernameIsNull(role, moduleId);
    }

    @Transactional
    public void deletePermissionByUsernameAndModule(String username, String moduleId) {
        permissionRepository.deleteByUsernameAndModuleId(username, moduleId);
    }

    private ModulePermissionResponse mapToResponse(ModulePermission permission) {
        return ModulePermissionResponse.builder()
                .id(permission.getId())
                .role(permission.getRole())
                .username(permission.getUsername())
                .moduleId(permission.getModuleId())
                .permissionType(permission.getPermissionType())
                .build();
    }
}
