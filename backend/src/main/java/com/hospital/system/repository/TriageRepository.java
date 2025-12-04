package com.hospital.system.repository;

import com.hospital.system.model.Triage;
import com.hospital.system.model.TriagePriority;
import com.hospital.system.model.TriageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Triage entity operations.
 * Requirements 8.4: Display patients ordered by priority level and arrival time
 */
@Repository
public interface TriageRepository extends JpaRepository<Triage, Long> {

    /**
     * Get waiting list ordered by priority level (ascending) and arrival time (ascending).
     * Requirements 8.4: Display patients ordered by priority level and arrival time
     * @deprecated Use findByStatusOrderedByPriorityAndArrival instead for correct numeric ordering
     */
    @Query("SELECT t FROM Triage t WHERE t.status = :status ORDER BY t.priorityLevel ASC, t.arrivedAt ASC")
    List<Triage> findByStatusOrderByPriorityAndArrival(@Param("status") TriageStatus status);

    /**
     * Get all triage records for a patient.
     */
    List<Triage> findByPatientIdOrderByArrivedAtDesc(Long patientId);

    /**
     * Get triage records by status.
     */
    List<Triage> findByStatus(TriageStatus status);

    /**
     * Get triage records by priority level.
     */
    List<Triage> findByPriorityLevel(TriagePriority priorityLevel);

    /**
     * Get triage records by nurse.
     */
    List<Triage> findByNurseId(Long nurseId);

    /**
     * Get waiting list (WAITING status) ordered by priority and arrival time.
     * Requirements 8.4: Display patients ordered by priority level and arrival time
     * Uses CASE statement to order by numeric priority level (1-5) rather than alphabetical enum name.
     */
    @Query("SELECT t FROM Triage t WHERE t.status = 'WAITING' ORDER BY " +
           "CASE t.priorityLevel " +
           "WHEN com.hospital.system.model.TriagePriority.RESUSCITATION THEN 1 " +
           "WHEN com.hospital.system.model.TriagePriority.EMERGENT THEN 2 " +
           "WHEN com.hospital.system.model.TriagePriority.URGENT THEN 3 " +
           "WHEN com.hospital.system.model.TriagePriority.LESS_URGENT THEN 4 " +
           "WHEN com.hospital.system.model.TriagePriority.NON_URGENT THEN 5 " +
           "ELSE 6 END ASC, t.arrivedAt ASC")
    List<Triage> findWaitingListOrdered();

    /**
     * Get waiting list by status ordered by priority and arrival time.
     * Requirements 8.4: Display patients ordered by priority level and arrival time
     */
    @Query("SELECT t FROM Triage t WHERE t.status = :status ORDER BY " +
           "CASE t.priorityLevel " +
           "WHEN com.hospital.system.model.TriagePriority.RESUSCITATION THEN 1 " +
           "WHEN com.hospital.system.model.TriagePriority.EMERGENT THEN 2 " +
           "WHEN com.hospital.system.model.TriagePriority.URGENT THEN 3 " +
           "WHEN com.hospital.system.model.TriagePriority.LESS_URGENT THEN 4 " +
           "WHEN com.hospital.system.model.TriagePriority.NON_URGENT THEN 5 " +
           "ELSE 6 END ASC, t.arrivedAt ASC")
    List<Triage> findByStatusOrderedByPriorityAndArrival(@Param("status") TriageStatus status);
}
