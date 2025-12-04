package com.hospital.system.dto;

import com.hospital.system.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceReportDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long doctorId;
    private String doctorName;
    private String specialty;
    private List<AttendanceRecordDTO> attendanceRecords;
    private int totalVisits;
    private int completedVisits;
    private int cancelledVisits;
    private int noShowVisits;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AttendanceRecordDTO {
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private LocalDateTime appointmentTime;
        private AppointmentStatus status;
        private String reason;
    }
}
