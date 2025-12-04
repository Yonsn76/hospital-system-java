package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for bed transfer information.
 * Requirements 7.3: Transfer record with source bed, destination bed, timestamp, and reason
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BedTransferResponse {
    private Long id;
    private Long hospitalizationId;
    private Long fromBedId;
    private Long toBedId;
    private LocalDateTime transferredAt;
    private String reason;
    private BedResponse fromBed;
    private BedResponse toBed;
}
