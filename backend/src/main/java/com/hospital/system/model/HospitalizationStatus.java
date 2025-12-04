package com.hospital.system.model;

/**
 * Status of a hospitalization record.
 * Requirements 7.1, 7.4: Track admission and discharge states
 */
public enum HospitalizationStatus {
    ACTIVE,
    DISCHARGED,
    TRANSFERRED
}
