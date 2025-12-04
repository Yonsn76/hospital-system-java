package com.hospital.system.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a patient referral to another specialist or service.
 * Requirements 9.1: Create referral with destination, reason, and urgency
 * Requirements 9.3: Track referral status and link resulting consultation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "referrals")
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "referring_doctor_id", nullable = false)
    private Long referringDoctorId;

    @Column(name = "destination_doctor_id")
    private Long destinationDoctorId;

    @Column(name = "destination_specialty")
    private String destinationSpecialty;

    @Column(name = "external_service")
    private String externalService;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReferralUrgency urgency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReferralStatus status;

    @Column(name = "resulting_appointment_id")
    private Long resultingAppointmentId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ReferralStatus.PENDING;
        }
    }
}
