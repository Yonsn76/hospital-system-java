package com.hospital.system.model.nursing;

/**
 * Priority levels for triage classification using a 5-level scale.
 * Requirements 8.2: Categorize using a 5-level scale (resuscitation, emergent, urgent, less urgent, non-urgent)
 */
public enum TriagePriority {
    RESUSCITATION(1),
    EMERGENT(2),
    URGENT(3),
    LESS_URGENT(4),
    NON_URGENT(5);

    private final int level;

    TriagePriority(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }
}
