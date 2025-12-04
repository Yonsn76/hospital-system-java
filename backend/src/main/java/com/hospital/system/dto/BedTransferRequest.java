package com.hospital.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for transferring a patient to another bed.
 * Requirements 7.3: Record transfer with timestamp and new location
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BedTransferRequest {

    @NotNull(message = "Target bed ID is required")
    private Long toBedId;

    @NotBlank(message = "Transfer reason is required")
    private String reason;
}
