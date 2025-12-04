package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VitalSignsResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long nurseId;
    private String nurseName;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer respiratoryRate;
    private Integer oxygenSaturation;
    private BigDecimal weight;
    private LocalDateTime recordedAt;
}
