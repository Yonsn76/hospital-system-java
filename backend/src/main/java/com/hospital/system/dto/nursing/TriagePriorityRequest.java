package com.hospital.system.dto.nursing;

import com.hospital.system.model.nursing.TriagePriority;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for assigning priority to a triage record.
 * Requirements 8.2: Assign priority level using 5-level scale
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TriagePriorityRequest {

    @NotNull(message = "Priority level is required")
    private TriagePriority priorityLevel;

    private String recommendedDestination;
}
