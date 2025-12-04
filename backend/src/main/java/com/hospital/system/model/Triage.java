package com.hospital.system.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a patient triage record.
 * Requirements 8.1, 8.2, 8.3: Record chief complaint, priority level, vital signs, and recommended destination
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "triage")
public class Triage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "nurse_id", nullable = false)
    private Long nurseId;

    @Column(name = "chief_complaint", nullable = false, columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "initial_assessment", columnDefinition = "TEXT")
    private String initialAssessment;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level")
    private TriagePriority priorityLevel;

    @Column(name = "recommended_destination")
    private String recommendedDestination;

    @Column(name = "vital_signs_id")
    private Long vitalSignsId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TriageStatus status;

    @Column(name = "arrived_at", nullable = false)
    private LocalDateTime arrivedAt;

    @Column(name = "triaged_at")
    private LocalDateTime triagedAt;

    @Column(name = "attended_at")
    private LocalDateTime attendedAt;

    @PrePersist
    protected void onCreate() {
        if (arrivedAt == null) {
            arrivedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = TriageStatus.WAITING;
        }
    }
}
