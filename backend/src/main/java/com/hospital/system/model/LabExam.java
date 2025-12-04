package com.hospital.system.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "lab_exams")
public class LabExam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "requesting_doctor_id", nullable = false)
    private Long requestingDoctorId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "exam_type", nullable = false)
    private String examType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExamPriority priority = ExamPriority.ROUTINE;

    @Column(name = "clinical_indication", columnDefinition = "TEXT")
    private String clinicalIndication;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ExamStatus status = ExamStatus.REQUESTED;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "labExam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LabResult> results = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        requestedAt = LocalDateTime.now();
        if (status == null) {
            status = ExamStatus.REQUESTED;
        }
        if (priority == null) {
            priority = ExamPriority.ROUTINE;
        }
    }
}
