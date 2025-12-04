package com.hospital.system.controller;

import com.hospital.system.dto.*;
import com.hospital.system.model.ExamStatus;
import com.hospital.system.service.LabExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-exams")
@RequiredArgsConstructor
public class LabExamController {

    private final LabExamService labExamService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<LabExamResponse> createLabExam(
            @Valid @RequestBody LabExamRequest request) {
        LabExamResponse response = labExamService.createLabExam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<LabExamResponse> getLabExamById(@PathVariable Long id) {
        return ResponseEntity.ok(labExamService.getLabExamById(id));
    }

    @PutMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<LabExamResponse> uploadResults(
            @PathVariable Long id,
            @Valid @RequestBody LabResultsUploadRequest request) {
        return ResponseEntity.ok(labExamService.uploadResults(id, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<LabExamResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam ExamStatus status) {
        return ResponseEntity.ok(labExamService.updateStatus(id, status));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<LabExamResponse>> getLabExamsByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(labExamService.getLabExamsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<LabExamResponse>> getPendingResultsForDoctor(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(labExamService.getPendingResultsForDoctor(doctorId));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<LabExamResponse>> getLabExamsByAppointment(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(labExamService.getLabExamsByAppointment(appointmentId));
    }
}
