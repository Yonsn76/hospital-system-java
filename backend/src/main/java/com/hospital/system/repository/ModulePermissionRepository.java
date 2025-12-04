package com.hospital.system.repository;

import com.hospital.system.model.ModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModulePermissionRepository extends JpaRepository<ModulePermission, Long> {
    
    List<ModulePermission> findByRole(String role);
    
    List<ModulePermission> findByUsername(String username);
    
    List<ModulePermission> findByRoleAndUsernameIsNull(String role);
    
    List<ModulePermission> findByUsernameIsNotNull();
    
    Optional<ModulePermission> findByRoleAndModuleIdAndUsernameIsNull(String role, String moduleId);
    
    Optional<ModulePermission> findByUsernameAndModuleId(String username, String moduleId);
    
    void deleteByRoleAndModuleIdAndUsernameIsNull(String role, String moduleId);
    
    void deleteByUsernameAndModuleId(String username, String moduleId);
}
