package com.hospital.system.dto;

import com.hospital.system.model.AllergySeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllergyRequest {
    
    @NotBlank(message = "Allergy name is required")
    private String allergyName;
    
    @NotNull(message = "Severity is required")
    private AllergySeverity severity;
    
    private String notes;
}
