package com.hospital.system.repository.resource;

import com.hospital.system.model.resource.Resource;
import com.hospital.system.model.resource.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);
}
