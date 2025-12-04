package com.hospital.system.model;

/**
 * Status of a triage record.
 * Requirements 8.5: Track triage status from waiting to attended
 */
public enum TriageStatus {
    WAITING,
    IN_PROGRESS,
    ATTENDED,
    LEFT
}
