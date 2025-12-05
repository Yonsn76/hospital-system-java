package com.hospital.system.model.hospitalization;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a patient hospitalization record.
 * Requirements 7.1, 7.2, 7.3, 7.4, 7.6: Manage patient admissions, bed assignments, transfers, and discharges
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hospitalizations")
public class Hospitalization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "admitting_doctor_id", nullable = false)
    private Long admittingDoctorId;

    @Column(name = "bed_id")
    private Long bedId;

    @Column(name = "admission_date", nullable = false)
    private LocalDateTime admissionDate;

    @Column(name = "discharge_date")
    private LocalDateTime dischargeDate;

    @Column(name = "admission_reason", nullable = false, columnDefinition = "TEXT")
    private String admissionReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "discharge_type")
    private DischargeType dischargeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HospitalizationStatus status;

    @PrePersist
    protected void onCreate() {
        if (admissionDate == null) {
            admissionDate = LocalDateTime.now();
        }
        if (status == null) {
            status = HospitalizationStatus.ACTIVE;
        }
    }
}
