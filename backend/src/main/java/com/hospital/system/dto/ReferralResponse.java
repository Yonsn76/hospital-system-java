package com.hospital.system.dto;

import com.hospital.system.model.ReferralStatus;
import com.hospital.system.model.ReferralUrgency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for referral information.
 * Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReferralResponse {
    private Long id;
    private Long patientId;
    private Long referringDoctorId;
    private Long destinationDoctorId;
    private String destinationSpecialty;
    private String externalService;
    private String reason;
    private ReferralUrgency urgency;
    private ReferralStatus status;
    private Long resultingAppointmentId;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
