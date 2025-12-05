package com.hospital.system.model.clinical;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vital_signs")
public class VitalSigns {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "nurse_id", nullable = false)
    private Long nurseId;

    @Column(name = "blood_pressure_systolic", nullable = false)
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic", nullable = false)
    private Integer bloodPressureDiastolic;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal temperature;

    @Column(name = "heart_rate", nullable = false)
    private Integer heartRate;

    @Column(name = "respiratory_rate", nullable = false)
    private Integer respiratoryRate;

    @Column(name = "oxygen_saturation", nullable = false)
    private Integer oxygenSaturation;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }
}
