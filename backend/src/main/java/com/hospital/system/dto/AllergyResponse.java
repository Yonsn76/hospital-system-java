package com.hospital.system.dto;

import com.hospital.system.model.AllergySeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllergyResponse {
    private Long id;
    private Long patientId;
    private String allergyName;
    private AllergySeverity severity;
    private String notes;
    private LocalDateTime createdAt;
}
