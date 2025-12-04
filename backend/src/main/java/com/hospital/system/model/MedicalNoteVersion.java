package com.hospital.system.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medical_note_versions")
public class MedicalNoteVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_note_id", nullable = false)
    private MedicalNote medicalNote;

    @Column(name = "version_number")
    private Integer versionNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "treatment_plan", nullable = false, columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(name = "modified_by", nullable = false)
    private Long modifiedBy;

    @Column(name = "modified_at", nullable = false)
    private LocalDateTime modifiedAt;

    @PrePersist
    protected void onCreate() {
        modifiedAt = LocalDateTime.now();
    }
}
