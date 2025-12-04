package com.hospital.system.dto;

import com.hospital.system.model.ReferralStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating referral status.
 * Requirements 9.3: Update referral status and link resulting consultation
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReferralStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ReferralStatus status;

    private Long resultingAppointmentId;
}
