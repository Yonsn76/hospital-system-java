package com.hospital.system.repository;

import com.hospital.system.model.ClinicalEvolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicalEvolutionRepository extends JpaRepository<ClinicalEvolution, Long> {
    
    List<ClinicalEvolution> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    List<ClinicalEvolution> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    
    Optional<ClinicalEvolution> findByAppointmentId(Long appointmentId);
    
    @Query("SELECT ce FROM ClinicalEvolution ce WHERE LOWER(ce.evolutionNotes) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<ClinicalEvolution> searchByEvolutionNotes(@Param("term") String term);
    
    @Query("SELECT DISTINCT ce.patientId FROM ClinicalEvolution ce WHERE LOWER(ce.evolutionNotes) LIKE LOWER(CONCAT('%', :condition, '%'))")
    List<Long> findPatientIdsByConditionInNotes(@Param("condition") String condition);
}
