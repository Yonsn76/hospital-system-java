package com.hospital.system.dto.lab;

import com.hospital.system.model.lab.ExamPriority;
import com.hospital.system.model.lab.ExamStatus;
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
public class LabExamResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long requestingDoctorId;
    private String requestingDoctorName;
    private Long appointmentId;
    private String examType;
    private ExamPriority priority;
    private String clinicalIndication;
    private ExamStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private List<LabResultResponse> results;
}
