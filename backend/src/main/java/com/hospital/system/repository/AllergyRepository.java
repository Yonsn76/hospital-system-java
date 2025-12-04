package com.hospital.system.repository;

import com.hospital.system.model.Allergy;
import com.hospital.system.model.AllergySeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    
    List<Allergy> findByPatientId(Long patientId);
    
    List<Allergy> findByPatientIdAndSeverity(Long patientId, AllergySeverity severity);
    
    @Query("SELECT a FROM Allergy a WHERE LOWER(a.allergyName) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Allergy> searchByAllergyName(@Param("term") String term);
    
    boolean existsByPatientIdAndAllergyNameIgnoreCase(Long patientId, String allergyName);
}
