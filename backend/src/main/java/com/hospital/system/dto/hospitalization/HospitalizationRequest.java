package com.hospital.system.dto.hospitalization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a hospitalization (admission).
 * Requirements 7.1: Create hospitalization record with admission date, reason, and admitting doctor
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HospitalizationRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Admitting doctor ID is required")
    private Long admittingDoctorId;

    @NotBlank(message = "Admission reason is required")
    private String admissionReason;

    private Long bedId;
}
