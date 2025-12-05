package com.hospital.system.dto.medical;

import com.hospital.system.model.medical.PrescriptionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PrescriptionStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private PrescriptionStatus status;
}
