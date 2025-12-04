package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportFilterRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long doctorId;
    private String specialty;
    private Integer visitThreshold;
}
