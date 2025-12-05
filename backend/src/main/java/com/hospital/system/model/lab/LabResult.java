package com.hospital.system.model.lab;

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
@Table(name = "lab_results")
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_exam_id", nullable = false)
    private LabExam labExam;

    @Column(name = "parameter_name", nullable = false)
    private String parameterName;

    @Column(name = "result_value", nullable = false)
    private String resultValue;

    @Column(name = "reference_range")
    private String referenceRange;

    @Column(name = "is_abnormal")
    @Builder.Default
    private Boolean isAbnormal = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "uploaded_by", nullable = false)
    private Long uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (isAbnormal == null) {
            isAbnormal = false;
        }
    }
}
