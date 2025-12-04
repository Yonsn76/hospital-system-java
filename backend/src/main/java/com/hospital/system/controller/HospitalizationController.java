package com.hospital.system.controller;

import com.hospital.system.dto.*;
import com.hospital.system.model.BedStatus;
import com.hospital.system.service.BedService;
import com.hospital.system.service.HospitalizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for hospitalization and bed management operations.
 * Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HospitalizationController {

    private final HospitalizationService hospitalizationService;
    private final BedService bedService;

    // ==================== Hospitalization Endpoints ====================

    /**
     * Admit a patient to the hospital.
     * Requirements 7.1: Create hospitalization record with admission date, reason, and admitting doctor
     */
    @PostMapping("/hospitalizations")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<HospitalizationResponse> admitPatient(
            @Valid @RequestBody HospitalizationRequest request) {
        HospitalizationResponse response = hospitalizationService.admitPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get hospitalization by ID.
     */
    @GetMapping("/hospitalizations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<HospitalizationResponse> getHospitalization(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalizationService.getHospitalizationById(id));
    }

    /**
     * Get all active hospitalizations.
     */
    @GetMapping("/hospitalizations/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<HospitalizationResponse>> getActiveHospitalizations() {
        return ResponseEntity.ok(hospitalizationService.getActiveHospitalizations());
    }


    /**
     * Assign a bed to a hospitalization.
     * Requirements 7.2: Update bed status to occupied and link to hospitalization
     */
    @PutMapping("/hospitalizations/{id}/assign-bed")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<HospitalizationResponse> assignBed(
            @PathVariable Long id,
            @Valid @RequestBody BedAssignmentRequest request) {
        return ResponseEntity.ok(hospitalizationService.assignBed(id, request));
    }

    /**
     * Transfer a patient to another bed.
     * Requirements 7.3: Record transfer with timestamp and new location
     */
    @PutMapping("/hospitalizations/{id}/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<HospitalizationResponse> transferPatient(
            @PathVariable Long id,
            @Valid @RequestBody BedTransferRequest request) {
        return ResponseEntity.ok(hospitalizationService.transferPatient(id, request));
    }

    /**
     * Discharge a patient.
     * Requirements 7.4: Record discharge date, discharge type, and release the assigned bed
     */
    @PutMapping("/hospitalizations/{id}/discharge")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<HospitalizationResponse> dischargePatient(
            @PathVariable Long id,
            @Valid @RequestBody DischargeRequest request) {
        return ResponseEntity.ok(hospitalizationService.dischargePatient(id, request));
    }

    /**
     * Get patient's hospitalization history.
     * Requirements 7.6: Display all past and current admissions
     */
    @GetMapping("/patients/{patientId}/hospitalizations")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<HospitalizationResponse>> getPatientHospitalizations(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(hospitalizationService.getPatientHospitalizations(patientId));
    }

    /**
     * Get transfer history for a hospitalization.
     * Requirements 7.3: Track patient transfers
     */
    @GetMapping("/hospitalizations/{id}/transfers")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<BedTransferResponse>> getTransferHistory(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalizationService.getTransferHistory(id));
    }

    // ==================== Bed Endpoints ====================

    /**
     * Create a new bed.
     */
    @PostMapping("/beds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BedResponse> createBed(@Valid @RequestBody BedRequest request) {
        BedResponse response = bedService.createBed(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all beds with status.
     * Requirements 7.5: Display real-time status of all beds by area
     */
    @GetMapping("/beds")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<BedResponse>> getAllBeds() {
        return ResponseEntity.ok(bedService.getAllBeds());
    }

    /**
     * Get available beds.
     * Requirements 7.5: Display real-time status of all beds by area
     */
    @GetMapping("/beds/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<BedResponse>> getAvailableBeds() {
        return ResponseEntity.ok(bedService.getAvailableBeds());
    }

    /**
     * Get bed by ID.
     */
    @GetMapping("/beds/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<BedResponse> getBedById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.getBedById(id));
    }

    /**
     * Get beds by area.
     */
    @GetMapping("/beds/area/{area}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<BedResponse>> getBedsByArea(@PathVariable String area) {
        return ResponseEntity.ok(bedService.getBedsByArea(area));
    }

    /**
     * Get beds by status.
     */
    @GetMapping("/beds/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<BedResponse>> getBedsByStatus(@PathVariable BedStatus status) {
        return ResponseEntity.ok(bedService.getBedsByStatus(status));
    }

    /**
     * Update bed information.
     */
    @PutMapping("/beds/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BedResponse> updateBed(
            @PathVariable Long id,
            @Valid @RequestBody BedRequest request) {
        return ResponseEntity.ok(bedService.updateBed(id, request));
    }

    /**
     * Update bed status.
     */
    @PutMapping("/beds/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    public ResponseEntity<BedResponse> updateBedStatus(
            @PathVariable Long id,
            @RequestParam BedStatus status) {
        return ResponseEntity.ok(bedService.updateBedStatus(id, status));
    }

    /**
     * Delete a bed.
     */
    @DeleteMapping("/beds/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
        return ResponseEntity.noContent().build();
    }
}
