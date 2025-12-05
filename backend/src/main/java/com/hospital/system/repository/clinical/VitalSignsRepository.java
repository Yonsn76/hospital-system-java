package com.hospital.system.repository.clinical;

import com.hospital.system.model.clinical.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VitalSignsRepository extends JpaRepository<VitalSigns, Long> {

    List<VitalSigns> findByPatientIdOrderByRecordedAtDesc(Long patientId);

    @Query("SELECT vs FROM VitalSigns vs WHERE vs.patientId = :patientId ORDER BY vs.recordedAt DESC LIMIT 1")
    Optional<VitalSigns> findLatestByPatientId(@Param("patientId") Long patientId);

    List<VitalSigns> findByNurseIdOrderByRecordedAtDesc(Long nurseId);
}
