package com.hospital.system.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FrequentPatientsDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private int visitThreshold;
    private List<FrequentPatientDTO> frequentPatients;
    private int totalFrequentPatients;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FrequentPatientDTO {
        private Long patientId;
        private String patientName;
        private String contactNumber;
        private int visitCount;
        private LocalDate lastVisitDate;
        private List<String> primaryDiagnoses;
    }
}
