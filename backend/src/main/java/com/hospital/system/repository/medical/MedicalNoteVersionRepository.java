package com.hospital.system.repository.medical;

import com.hospital.system.model.medical.MedicalNoteVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalNoteVersionRepository extends JpaRepository<MedicalNoteVersion, Long> {

    List<MedicalNoteVersion> findByMedicalNoteIdOrderByVersionNumberDesc(Long medicalNoteId);

    List<MedicalNoteVersion> findByMedicalNoteIdOrderByModifiedAtDesc(Long medicalNoteId);
}
