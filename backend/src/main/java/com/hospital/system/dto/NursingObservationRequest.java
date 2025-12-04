package com.hospital.system.dto;

import com.hospital.system.model.ObservationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NursingObservationRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Nurse ID is required")
    private Long nurseId;

    @NotNull(message = "Observation type is required")
    private ObservationType observationType;

    @NotBlank(message = "Notes are required")
    private String notes;
}
