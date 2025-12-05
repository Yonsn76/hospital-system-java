package com.hospital.system.repository.nursing;

import com.hospital.system.model.nursing.NursingObservation;
import com.hospital.system.model.nursing.ObservationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NursingObservationRepository extends JpaRepository<NursingObservation, Long> {

    List<NursingObservation> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<NursingObservation> findByPatientIdAndObservationTypeOrderByCreatedAtDesc(
            Long patientId, ObservationType observationType);

    List<NursingObservation> findByNurseIdOrderByCreatedAtDesc(Long nurseId);
}
