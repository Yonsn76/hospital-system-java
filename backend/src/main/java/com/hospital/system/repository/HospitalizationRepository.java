package com.hospital.system.repository;

import com.hospital.system.model.Hospitalization;
import com.hospital.system.model.HospitalizationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Hospitalization entity operations.
 * Requirements 7.6: Display all past and current admissions for a patient
 */
@Repository
public interface HospitalizationRepository extends JpaRepository<Hospitalization, Long> {

    List<Hospitalization> findByPatientIdOrderByAdmissionDateDesc(Long patientId);

    List<Hospitalization> findByPatientIdAndStatus(Long patientId, HospitalizationStatus status);

    Optional<Hospitalization> findByPatientIdAndStatusAndBedIdIsNotNull(Long patientId, HospitalizationStatus status);

    List<Hospitalization> findByStatus(HospitalizationStatus status);

    List<Hospitalization> findByAdmittingDoctorId(Long doctorId);

    Optional<Hospitalization> findByBedId(Long bedId);
}
