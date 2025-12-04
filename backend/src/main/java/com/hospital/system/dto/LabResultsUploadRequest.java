package com.hospital.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LabResultsUploadRequest {

    @NotNull(message = "Uploaded by user ID is required")
    private Long uploadedBy;

    @NotEmpty(message = "At least one result is required")
    @Valid
    private List<LabResultItemRequest> results;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LabResultItemRequest {

        @NotNull(message = "Parameter name is required")
        private String parameterName;

        @NotNull(message = "Result value is required")
        private String resultValue;

        private String referenceRange;

        private Boolean isAbnormal;

        private String notes;
    }
}
