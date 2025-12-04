package com.hospital.system.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a bed transfer record.
 * Requirements 7.3: Record patient transfers between beds with timestamp and location
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bed_transfers")
public class BedTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hospitalization_id", nullable = false)
    private Long hospitalizationId;

    @Column(name = "from_bed_id", nullable = false)
    private Long fromBedId;

    @Column(name = "to_bed_id", nullable = false)
    private Long toBedId;

    @Column(name = "transferred_at", nullable = false)
    private LocalDateTime transferredAt;

    @Column(nullable = false)
    private String reason;

    @PrePersist
    protected void onCreate() {
        if (transferredAt == null) {
            transferredAt = LocalDateTime.now();
        }
    }
}
