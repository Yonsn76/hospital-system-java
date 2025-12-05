package com.hospital.system.dto.hospitalization;

import com.hospital.system.model.hospitalization.BedStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating or updating a bed.
 * Requirements 7.2, 7.5
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BedRequest {

    @NotBlank(message = "Bed number is required")
    private String bedNumber;

    @NotBlank(message = "Area is required")
    private String area;

    private BedStatus status;
}
