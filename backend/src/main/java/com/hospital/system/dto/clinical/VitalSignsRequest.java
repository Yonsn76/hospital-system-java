package com.hospital.system.dto.clinical;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VitalSignsRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Nurse ID is required")
    private Long nurseId;

    @NotNull(message = "Systolic blood pressure is required")
    @Positive(message = "Systolic blood pressure must be positive")
    private Integer bloodPressureSystolic;

    @NotNull(message = "Diastolic blood pressure is required")
    @Positive(message = "Diastolic blood pressure must be positive")
    private Integer bloodPressureDiastolic;

    @NotNull(message = "Temperature is required")
    private BigDecimal temperature;

    @NotNull(message = "Heart rate is required")
    @Positive(message = "Heart rate must be positive")
    private Integer heartRate;

    @NotNull(message = "Respiratory rate is required")
    @Positive(message = "Respiratory rate must be positive")
    private Integer respiratoryRate;

    @NotNull(message = "Oxygen saturation is required")
    @Positive(message = "Oxygen saturation must be positive")
    private Integer oxygenSaturation;

    private BigDecimal weight;
}
