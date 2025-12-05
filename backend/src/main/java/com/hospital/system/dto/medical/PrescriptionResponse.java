package com.hospital.system.dto.medical;

import com.hospital.system.model.medical.PrescriptionStatus;
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
public class PrescriptionResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long appointmentId;
    private PrescriptionStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private List<PrescriptionItemResponse> items;
}
