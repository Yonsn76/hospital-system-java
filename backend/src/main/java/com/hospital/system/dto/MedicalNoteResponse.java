package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalNoteResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long appointmentId;
    private Long doctorId;
    private String doctorName;
    private String diagnosis;
    private String treatmentPlan;
    private LocalDate followUpDate;
    private String followUpInstructions;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MedicalNoteVersionResponse> versionHistory;
}
