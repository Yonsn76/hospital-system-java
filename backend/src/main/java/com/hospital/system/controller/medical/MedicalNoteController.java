package com.hospital.system.controller.medical;


import com.hospital.system.dto.medical.*;
import com.hospital.system.service.medical.MedicalNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-notes")
@RequiredArgsConstructor
public class MedicalNoteController {

    private final MedicalNoteService medicalNoteService;

    @PostMapping
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'notas-medicas')")
    public ResponseEntity<MedicalNoteResponse> createMedicalNote(
            @Valid @RequestBody MedicalNoteRequest request,
            Authentication authentication) {
        MedicalNoteResponse response = medicalNoteService.createMedicalNote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'notas-medicas')")
    public ResponseEntity<MedicalNoteResponse> getMedicalNoteById(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(medicalNoteService.getMedicalNoteById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'notas-medicas')")
    public ResponseEntity<MedicalNoteResponse> updateMedicalNote(
            @PathVariable Long id,
            @Valid @RequestBody MedicalNoteUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(medicalNoteService.updateMedicalNote(id, request));
    }

    @GetMapping("/{id}/versions")
    @PreAuthorize("@modulePermission.hasAccess(authentication, 'notas-medicas')")
    public ResponseEntity<List<MedicalNoteVersionResponse>> getVersionHistory(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(medicalNoteService.getVersionHistory(id));
    }
}
