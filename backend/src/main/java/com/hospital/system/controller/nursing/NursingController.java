package com.hospital.system.controller.nursing;

import com.hospital.system.dto.clinical.*;
import com.hospital.system.dto.nursing.*;
import com.hospital.system.model.nursing.ObservationType;
import com.hospital.system.service.nursing.NursingObservationService;
import com.hospital.system.service.clinical.VitalSignsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'enfermeria')")
    public ResponseEntity<VitalSignsResponse> recordVitalSigns(
            @Valid @RequestBody VitalSignsRequest request,
            Authentication authentication) {
        VitalSignsResponse response = vitalSignsService.recordVitalSigns(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/vital-signs/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'enfermeria')")
    public ResponseEntity<VitalSignsResponse> getVitalSignsById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(vitalSignsService.getVitalSignsById(id));
    }

    @GetMapping("/patients/{patientId}/vital-signs")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'enfermeria')")
    public ResponseEntity<List<VitalSignsResponse>> getVitalSignsByPatient(
            @PathVariable Long patientId,
            Authentication authentication) {
        return ResponseEntity.ok(vitalSignsService.getVitalSignsByPatient(patientId));
    }


    @GetMapping("/patients/{patientId}/vital-signs/latest")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'enfermeria')")
    public ResponseEntity<VitalSignsResponse> getLatestVitalSigns(
            @PathVariable Long patientId,
            Authentication authentication) {
        return ResponseEntity.ok(vitalSignsService.getLatestVitalSigns(patientId));
    }

    // Nursing Observations Endpoints

    @PostMapping("/nursing-observations")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'enfermeria')")
    public ResponseEntity<NursingObservationResponse> createObservation(
            @Valid @RequestBody NursingObservationRequest request,
            Authentication authentication) {
        NursingObservationResponse response = nursingObservationService.createObservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/nursing-observations/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'enfermeria')")
    public ResponseEntity<NursingObservationResponse> getObservationById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(nursingObservationService.getObservationById(id));
    }

    @GetMapping("/patients/{patientId}/nursing-observations")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'enfermeria')")
    public ResponseEntity<List<NursingObservationResponse>> getObservationsByPatient(
            @PathVariable Long patientId,
            @RequestParam(required = false) ObservationType type,
            Authentication authentication) {
        if (type != null) {
            return ResponseEntity.ok(
                    nursingObservationService.getObservationsByPatientAndType(patientId, type));
        }
        return ResponseEntity.ok(nursingObservationService.getObservationsByPatient(patientId));
    }
}
