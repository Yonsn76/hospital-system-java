package com.hospital.system.dto;

import com.hospital.system.model.TriagePriority;
import com.hospital.system.model.TriageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for triage information.
 * Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TriageResponse {
    private Long id;
    private Long patientId;
    private Long nurseId;
    private String chiefComplaint;
    private String initialAssessment;
    private TriagePriority priorityLevel;
    private Integer priorityLevelValue;
    private String recommendedDestination;
    private Long vitalSignsId;
    private TriageStatus status;
    private LocalDateTime arrivedAt;
    private LocalDateTime triagedAt;
    private LocalDateTime attendedAt;
    private VitalSignsResponse vitalSigns;
}
