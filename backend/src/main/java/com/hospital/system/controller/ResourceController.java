package com.hospital.system.controller;

import com.hospital.system.dto.ResourceRequest;
import com.hospital.system.dto.ResourceResponse;
import com.hospital.system.model.ResourceStatus;
import com.hospital.system.model.ResourceType;
import com.hospital.system.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> createResource(@RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResourceResponse>> getResourcesByType(@PathVariable ResourceType type) {
        return ResponseEntity.ok(resourceService.getResourcesByType(type));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> updateStatus(@PathVariable Long id, @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
