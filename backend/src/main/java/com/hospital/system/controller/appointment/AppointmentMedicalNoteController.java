package com.hospital.system.controller.appointment;

import com.hospital.system.dto.medical.MedicalNoteResponse;
import com.hospital.system.service.medical.MedicalNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentMedicalNoteController {

    private final MedicalNoteService medicalNoteService;

    @GetMapping("/{appointmentId}/medical-note")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<MedicalNoteResponse> getMedicalNoteByAppointment(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(medicalNoteService.getMedicalNoteByAppointment(appointmentId));
    }
}
