package com.hospital.system.controller;

import com.hospital.system.dto.MedicalNoteResponse;
import com.hospital.system.service.MedicalNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientMedicalNoteController {

    private final MedicalNoteService medicalNoteService;

    @GetMapping("/{patientId}/medical-notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<MedicalNoteResponse>> getMedicalNotesByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(medicalNoteService.getMedicalNotesByPatient(patientId));
    }
}
