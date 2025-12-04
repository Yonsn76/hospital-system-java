package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LabResultResponse {

    private Long id;
    private Long labExamId;
    private String parameterName;
    private String resultValue;
    private String referenceRange;
    private Boolean isAbnormal;
    private String notes;
    private Long uploadedBy;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}
