package com.hospital.system.dto.medical;

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
public class PrescriptionPrintResponse {

    private Long prescriptionId;
    
    // Patient info
    private String patientName;
    private String patientDateOfBirth;
    private String patientGender;
    
    // Doctor info
    private String doctorName;
    private String doctorSpecialty;
    
    // Prescription details
    private LocalDateTime prescriptionDate;
    private String notes;
    private List<PrescriptionItemResponse> medications;
    
    // Hospital info
    private String hospitalName;
    private String hospitalAddress;
}
