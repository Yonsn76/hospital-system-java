package com.hospital.system.dto.hospitalization;

import com.hospital.system.model.hospitalization.DischargeType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for discharging a patient.
 * Requirements 7.4: Record discharge date, discharge type, and release the assigned bed
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DischargeRequest {

    @NotNull(message = "Discharge type is required")
    private DischargeType dischargeType;

    private String notes;
}
