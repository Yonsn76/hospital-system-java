package com.hospital.system.dto.hospitalization;

import com.hospital.system.model.hospitalization.BedStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for bed information.
 * Requirements 7.5: Display real-time status of all beds by area
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BedResponse {
    private Long id;
    private String bedNumber;
    private String area;
    private BedStatus status;
    private Long currentHospitalizationId;
}
