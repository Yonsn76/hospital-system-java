package com.hospital.system.dto.clinical;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicalHistoryResponse {
    private Long id;
    private Long patientId;
    private String antecedentes;
    private String observaciones;
    private List<AllergyResponse> allergies;
    private List<ChronicDiseaseResponse> chronicDiseases;
    private List<ClinicalEvolutionResponse> evolutions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
