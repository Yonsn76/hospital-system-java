package com.hospital.system.controller.medical;

import com.hospital.system.dto.medical.PrescriptionResponse;
import com.hospital.system.model.medical.PrescriptionStatus;
import com.hospital.system.service.medical.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientPrescriptionController {

    private final PrescriptionService prescriptionService;

    @GetMapping("/{patientId}/prescriptions")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<PrescriptionResponse>> getPrescriptionsByPatient(
            @PathVariable Long patientId,
            @RequestParam(required = false) PrescriptionStatus status) {
        if (status != null) {
            return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientAndStatus(patientId, status));
        }
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatient(patientId));
    }
}
