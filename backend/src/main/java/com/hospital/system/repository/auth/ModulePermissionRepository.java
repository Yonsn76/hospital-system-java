package com.hospital.system.repository.auth;

import com.hospital.system.model.auth.ModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // ===== Métodos batch para optimizar eliminaciones =====

    /**
     * Elimina todos los permisos personalizados de un rol (no afecta permisos de
     * usuarios)
     */
    @Modifying
    @Query("DELETE FROM ModulePermission p WHERE p.role = :role AND p.username IS NULL")
    int deleteAllByRoleAndUsernameIsNull(@Param("role") String role);

    /**
     * Elimina todos los permisos personalizados de un usuario
     */
    @Modifying
    @Query("DELETE FROM ModulePermission p WHERE p.username = :username")
    int deleteAllByUsername(@Param("username") String username);

    /**
     * Cuenta los permisos de un rol específico
     */
    @Query("SELECT COUNT(p) FROM ModulePermission p WHERE p.role = :role AND p.username IS NULL")
    long countByRoleAndUsernameIsNull(@Param("role") String role);

    /**
     * Cuenta los permisos de un usuario específico
     */
    @Query("SELECT COUNT(p) FROM ModulePermission p WHERE p.username = :username")
    long countByUsername(@Param("username") String username);
}
