package com.hospital.system.dto;

import com.hospital.system.model.ReferralUrgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a referral.
 * Requirements 9.1: Create referral with destination, reason, and urgency
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReferralRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Referring doctor ID is required")
    private Long referringDoctorId;

    private Long destinationDoctorId;

    private String destinationSpecialty;

    private String externalService;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotNull(message = "Urgency is required")
    private ReferralUrgency urgency;
}
