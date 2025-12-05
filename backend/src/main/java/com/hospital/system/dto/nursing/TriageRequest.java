package com.hospital.system.dto.nursing;

import com.hospital.system.model.nursing.TriagePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a triage record.
 * Requirements 8.1, 8.2, 8.3: Record chief complaint, priority level, and recommended destination
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TriageRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Nurse ID is required")
    private Long nurseId;

    @NotBlank(message = "Chief complaint is required")
    private String chiefComplaint;

    private String initialAssessment;

    private TriagePriority priorityLevel;

    private String recommendedDestination;

    private Long vitalSignsId;
}
