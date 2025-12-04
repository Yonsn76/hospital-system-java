package com.hospital.system.repository;

import com.hospital.system.model.Referral;
import com.hospital.system.model.ReferralStatus;
import com.hospital.system.model.ReferralUrgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Referral entity operations.
 * Requirements 9.4: View patient's referral history
 * Requirements 9.5: Display pending referrals for doctors
 */
@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {

    /**
     * Get all referrals for a patient ordered by creation date descending.
     * Requirements 9.4: View patient's referral history with current status
     */
    List<Referral> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    /**
     * Get pending referrals for a destination doctor.
     * Requirements 9.5: Display pending referrals in doctor's list
     */
    List<Referral> findByDestinationDoctorIdAndStatusOrderByCreatedAtDesc(Long doctorId, ReferralStatus status);

    /**
     * Get all referrals created by a referring doctor.
     */
    List<Referral> findByReferringDoctorIdOrderByCreatedAtDesc(Long doctorId);

    /**
     * Get referrals by status.
     */
    List<Referral> findByStatus(ReferralStatus status);

    /**
     * Get referrals by urgency level.
     */
    List<Referral> findByUrgency(ReferralUrgency urgency);

    /**
     * Get pending referrals for a destination doctor ordered by urgency and creation date.
     * Requirements 9.5: Display pending referrals for doctors
     */
    @Query("SELECT r FROM Referral r WHERE r.destinationDoctorId = :doctorId AND r.status = 'PENDING' " +
           "ORDER BY CASE r.urgency " +
           "WHEN com.hospital.system.model.ReferralUrgency.URGENT THEN 1 " +
           "WHEN com.hospital.system.model.ReferralUrgency.PRIORITY THEN 2 " +
           "WHEN com.hospital.system.model.ReferralUrgency.ROUTINE THEN 3 " +
           "ELSE 4 END ASC, r.createdAt ASC")
    List<Referral> findPendingReferralsForDoctor(@Param("doctorId") Long doctorId);

    /**
     * Get referrals by destination specialty.
     */
    List<Referral> findByDestinationSpecialtyOrderByCreatedAtDesc(String specialty);
}
