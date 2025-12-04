package com.hospital.system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for assigning a bed to a hospitalization.
 * Requirements 7.2: Assign bed to patient and update bed status
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BedAssignmentRequest {

    @NotNull(message = "Bed ID is required")
    private Long bedId;
}
