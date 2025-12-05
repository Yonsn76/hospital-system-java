package com.hospital.system.dto.hospitalization;

import com.hospital.system.model.hospitalization.DischargeType;
import com.hospital.system.model.hospitalization.HospitalizationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for hospitalization information.
 * Requirements 7.1, 7.4, 7.6
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HospitalizationResponse {
    private Long id;
    private Long patientId;
    private Long admittingDoctorId;
    private Long bedId;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private String admissionReason;
    private DischargeType dischargeType;
    private HospitalizationStatus status;
    private BedResponse bed;
}
