package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicalEvolutionResponse {
    private Long id;
    private Long patientId;
    private Long appointmentId;
    private Long doctorId;
    private String doctorName;
    private String evolutionNotes;
    private LocalDateTime createdAt;
}
