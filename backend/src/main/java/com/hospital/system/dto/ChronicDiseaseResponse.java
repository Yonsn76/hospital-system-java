package com.hospital.system.dto;

import com.hospital.system.model.DiseaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChronicDiseaseResponse {
    private Long id;
    private Long patientId;
    private String diseaseName;
    private LocalDate diagnosisDate;
    private DiseaseStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
