package com.hospital.system.dto;

import com.hospital.system.model.ObservationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NursingObservationResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long nurseId;
    private String nurseName;
    private ObservationType observationType;
    private String notes;
    private LocalDateTime createdAt;
}
