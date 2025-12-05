package com.hospital.system.model.referral;

/**
 * Status lifecycle for referrals.
 * Requirements 9.3, 9.4: Track referral status from pending to completion
 * Valid transitions: PENDING → ACCEPTED → COMPLETED, or PENDING → CANCELLED
 */
public enum ReferralStatus {
    PENDING,
    ACCEPTED,
    COMPLETED,
    CANCELLED
}
