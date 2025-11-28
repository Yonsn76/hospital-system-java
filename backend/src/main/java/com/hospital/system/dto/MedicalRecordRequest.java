package com.hospital.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalRecordRequest {
    private Long patientId;
    private Long doctorId;
    private String diagnosis;
    private String treatment;
    private String prescription;
}
