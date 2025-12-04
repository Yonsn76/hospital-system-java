package com.hospital.system.dto;

import com.hospital.system.model.DiseaseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChronicDiseaseRequest {
    
    @NotBlank(message = "Disease name is required")
    private String diseaseName;
    
    @NotNull(message = "Diagnosis date is required")
    private LocalDate diagnosisDate;
    
    @NotNull(message = "Status is required")
    private DiseaseStatus status;
    
    private String notes;
}
