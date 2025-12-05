package com.hospital.system.dto.medical;

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
public class MedicalNoteUpdateRequest {

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Treatment plan is required")
    private String treatmentPlan;

    private LocalDate followUpDate;

    private String followUpInstructions;

    @NotNull(message = "Modified by user ID is required")
    private Long modifiedBy;
}
