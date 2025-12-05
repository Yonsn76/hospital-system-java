package com.hospital.system.dto.medical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalNoteVersionResponse {

    private Long id;
    private Long medicalNoteId;
    private Integer versionNumber;
    private String diagnosis;
    private String treatmentPlan;
    private Long modifiedBy;
    private String modifiedByName;
    private LocalDateTime modifiedAt;
}
