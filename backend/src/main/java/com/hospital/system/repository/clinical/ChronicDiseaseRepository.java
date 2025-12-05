package com.hospital.system.repository.clinical;

import com.hospital.system.model.clinical.ChronicDisease;
import com.hospital.system.model.clinical.DiseaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChronicDiseaseRepository extends JpaRepository<ChronicDisease, Long> {
    
    List<ChronicDisease> findByPatientId(Long patientId);
    
    List<ChronicDisease> findByPatientIdAndStatus(Long patientId, DiseaseStatus status);
    
    @Query("SELECT cd FROM ChronicDisease cd WHERE LOWER(cd.diseaseName) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<ChronicDisease> searchByDiseaseName(@Param("term") String term);
    
    @Query("SELECT DISTINCT cd.patientId FROM ChronicDisease cd WHERE LOWER(cd.diseaseName) LIKE LOWER(CONCAT('%', :condition, '%'))")
    List<Long> findPatientIdsByCondition(@Param("condition") String condition);
}
