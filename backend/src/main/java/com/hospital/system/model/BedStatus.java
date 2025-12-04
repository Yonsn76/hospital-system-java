package com.hospital.system.model;

/**
 * Status of a hospital bed.
 * Requirements 7.2, 7.4: Track bed availability and status changes
 */
public enum BedStatus {
    AVAILABLE,
    OCCUPIED,
    MAINTENANCE,
    RESERVED
}
