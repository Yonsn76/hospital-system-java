package com.hospital.system.controller.nursing;

import com.hospital.system.dto.nursing.TriagePriorityRequest;
import com.hospital.system.dto.nursing.TriageRequest;
import com.hospital.system.dto.nursing.TriageResponse;
import com.hospital.system.model.nursing.TriageStatus;
import com.hospital.system.service.nursing.TriageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for triage operations.
 * Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */
@RestController
@RequestMapping("/api/triage")
@RequiredArgsConstructor
public class TriageController {

    private final TriageService triageService;

    /**
     * Create a triage record for a patient.
     * Requirements 8.1: Allow recording of chief complaint and initial assessment
     * Usa permisos dinámicos basados en el módulo 'triage'
     */
    @PostMapping
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<TriageResponse> createTriage(@Valid @RequestBody TriageRequest request) {
        TriageResponse response = triageService.createTriage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get triage by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<TriageResponse> getTriageById(@PathVariable Long id) {
        return ResponseEntity.ok(triageService.getTriageById(id));
    }

    /**
     * Assign priority level to a triage record.
     * Requirements 8.2: Categorize using a 5-level scale (resuscitation, emergent, urgent, less urgent, non-urgent)
     * Requirements 8.3: Record priority level and recommended destination
     */
    @PutMapping("/{id}/priority")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<TriageResponse> assignPriority(
            @PathVariable Long id,
            @Valid @RequestBody TriagePriorityRequest request) {
        return ResponseEntity.ok(triageService.assignPriority(id, request));
    }


    /**
     * Mark a triaged patient as attended.
     * Requirements 8.5: Update the triage status and record the attending time
     */
    @PutMapping("/{id}/attend")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<TriageResponse> markAsAttended(@PathVariable Long id) {
        return ResponseEntity.ok(triageService.markAsAttended(id));
    }

    /**
     * Mark a triaged patient as in progress.
     */
    @PutMapping("/{id}/in-progress")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<TriageResponse> markAsInProgress(@PathVariable Long id) {
        return ResponseEntity.ok(triageService.markAsInProgress(id));
    }

    /**
     * Mark a triaged patient as left (without being attended).
     */
    @PutMapping("/{id}/left")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<TriageResponse> markAsLeft(@PathVariable Long id) {
        return ResponseEntity.ok(triageService.markAsLeft(id));
    }

    /**
     * Get the waiting list ordered by priority level and arrival time.
     * Requirements 8.4: Display patients ordered by priority level and arrival time
     */
    @GetMapping("/waiting-list")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<List<TriageResponse>> getWaitingList() {
        return ResponseEntity.ok(triageService.getWaitingList());
    }

    /**
     * Get triage records by status ordered by priority and arrival time.
     * Requirements 8.4: Display patients ordered by priority level and arrival time
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<List<TriageResponse>> getTriageByStatus(@PathVariable TriageStatus status) {
        return ResponseEntity.ok(triageService.getTriageByStatusOrdered(status));
    }

    /**
     * Get all triage records for a patient.
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'triage')")
    public ResponseEntity<List<TriageResponse>> getTriageByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(triageService.getTriageByPatient(patientId));
    }
}
