package com.hospital.system.controller;

import com.hospital.system.dto.*;
import com.hospital.system.service.MedicalNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-notes")
@RequiredArgsConstructor
public class MedicalNoteController {

    private final MedicalNoteService medicalNoteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<MedicalNoteResponse> createMedicalNote(
            @Valid @RequestBody MedicalNoteRequest request) {
        MedicalNoteResponse response = medicalNoteService.createMedicalNote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<MedicalNoteResponse> getMedicalNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(medicalNoteService.getMedicalNoteById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<MedicalNoteResponse> updateMedicalNote(
            @PathVariable Long id,
            @Valid @RequestBody MedicalNoteUpdateRequest request) {
        return ResponseEntity.ok(medicalNoteService.updateMedicalNote(id, request));
    }

    @GetMapping("/{id}/versions")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<MedicalNoteVersionResponse>> getVersionHistory(@PathVariable Long id) {
        return ResponseEntity.ok(medicalNoteService.getVersionHistory(id));
    }
}
