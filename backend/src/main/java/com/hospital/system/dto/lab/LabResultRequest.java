package com.hospital.system.dto.lab;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LabResultRequest {

    @NotBlank(message = "Parameter name is required")
    private String parameterName;

    @NotBlank(message = "Result value is required")
    private String resultValue;

    private String referenceRange;

    private Boolean isAbnormal;

    private String notes;

    @NotNull(message = "Uploaded by user ID is required")
    private Long uploadedBy;
}
