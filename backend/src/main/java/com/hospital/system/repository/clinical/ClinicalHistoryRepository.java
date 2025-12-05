package com.hospital.system.repository.clinical;

import com.hospital.system.model.clinical.ClinicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClinicalHistoryRepository extends JpaRepository<ClinicalHistory, Long> {
    
    Optional<ClinicalHistory> findByPatientId(Long patientId);
    
    boolean existsByPatientId(Long patientId);
}
