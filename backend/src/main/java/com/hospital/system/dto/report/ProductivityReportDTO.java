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
public class ProductivityReportDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<DoctorProductivityDTO> doctorProductivity;
    private int totalConsultations;
    private int totalPatients;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DoctorProductivityDTO {
        private Long doctorId;
        private String doctorName;
        private String specialization;
        private int consultationCount;
        private int uniquePatientCount;
        private int prescriptionCount;
        private int labExamCount;
    }
}
