package com.hospital.system.dto.medical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PrescriptionItemResponse {

    private Long id;
    private String medicationName;
    private String dose;
    private String frequency;
    private String duration;
    private String instructions;
}
