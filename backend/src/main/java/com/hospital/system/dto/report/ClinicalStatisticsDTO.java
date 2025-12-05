package com.hospital.system.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicalStatisticsDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalAppointments;
    private int totalPatients;
    private int totalPrescriptions;
    private int totalLabExams;
    private int totalHospitalizations;
    private int totalTriages;
    private List<DiagnosisStatDTO> topDiagnoses;
    private Map<String, Integer> appointmentsByStatus;
    private Map<String, Integer> prescriptionsByStatus;
    private Map<String, Integer> labExamsByStatus;
    private Map<String, Integer> triagesByPriority;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DiagnosisStatDTO {
        private String diagnosis;
        private int count;
        private double percentage;
    }
}
