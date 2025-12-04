package com.hospital.system.repository;

import com.hospital.system.model.ClinicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClinicalHistoryRepository extends JpaRepository<ClinicalHistory, Long> {
    
    Optional<ClinicalHistory> findByPatientId(Long patientId);
    
    boolean existsByPatientId(Long patientId);
}
