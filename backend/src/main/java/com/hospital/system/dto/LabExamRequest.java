package com.hospital.system.dto;

import com.hospital.system.model.ExamPriority;
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
public class LabExamRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Requesting doctor ID is required")
    private Long requestingDoctorId;

    private Long appointmentId;

    @NotBlank(message = "Exam type is required")
    private String examType;

    private ExamPriority priority;

    private String clinicalIndication;
}
