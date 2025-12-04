package com.hospital.system.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a hospital bed.
 * Requirements 7.2, 7.5: Manage bed assignments and track availability
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "beds")
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bed_number", nullable = false, unique = true)
    private String bedNumber;

    @Column(nullable = false)
    private String area;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BedStatus status;

    @Column(name = "current_hospitalization_id")
    private Long currentHospitalizationId;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = BedStatus.AVAILABLE;
        }
    }
}
