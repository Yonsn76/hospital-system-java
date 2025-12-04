package com.hospital.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PrescriptionItemRequest {

    @NotBlank(message = "Medication name is required")
    private String medicationName;

    @NotBlank(message = "Dose is required")
    private String dose;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    @NotBlank(message = "Duration is required")
    private String duration;

    private String instructions;
}
