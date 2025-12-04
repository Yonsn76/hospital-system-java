package com.hospital.system.controller;

import com.hospital.system.dto.*;
import com.hospital.system.model.ObservationType;
import com.hospital.system.service.NursingObservationService;
import com.hospital.system.service.VitalSignsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NursingController {

    private final VitalSignsService vitalSignsService;
    private final NursingObservationService nursingObservationService;

    // Vital Signs Endpoints

    @PostMapping("/vital-signs")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<VitalSignsResponse> recordVitalSigns(
            @Valid @RequestBody VitalSignsRequest request) {
        VitalSignsResponse response = vitalSignsService.recordVitalSigns(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/vital-signs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<VitalSignsResponse> getVitalSignsById(@PathVariable Long id) {
        return ResponseEntity.ok(vitalSignsService.getVitalSignsById(id));
    }

    @GetMapping("/patients/{patientId}/vital-signs")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<List<VitalSignsResponse>> getVitalSignsByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(vitalSignsService.getVitalSignsByPatient(patientId));
    }


    @GetMapping("/patients/{patientId}/vital-signs/latest")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<VitalSignsResponse> getLatestVitalSigns(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(vitalSignsService.getLatestVitalSigns(patientId));
    }

    // Nursing Observations Endpoints

    @PostMapping("/nursing-observations")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    public ResponseEntity<NursingObservationResponse> createObservation(
            @Valid @RequestBody NursingObservationRequest request) {
        NursingObservationResponse response = nursingObservationService.createObservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/nursing-observations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<NursingObservationResponse> getObservationById(@PathVariable Long id) {
        return ResponseEntity.ok(nursingObservationService.getObservationById(id));
    }

    @GetMapping("/patients/{patientId}/nursing-observations")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE', 'DOCTOR')")
    public ResponseEntity<List<NursingObservationResponse>> getObservationsByPatient(
            @PathVariable Long patientId,
            @RequestParam(required = false) ObservationType type) {
        if (type != null) {
            return ResponseEntity.ok(
                    nursingObservationService.getObservationsByPatientAndType(patientId, type));
        }
        return ResponseEntity.ok(nursingObservationService.getObservationsByPatient(patientId));
    }
}
