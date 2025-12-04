package com.hospital.system.repository;

import com.hospital.system.model.MedicalNoteVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalNoteVersionRepository extends JpaRepository<MedicalNoteVersion, Long> {

    List<MedicalNoteVersion> findByMedicalNoteIdOrderByVersionNumberDesc(Long medicalNoteId);

    List<MedicalNoteVersion> findByMedicalNoteIdOrderByModifiedAtDesc(Long medicalNoteId);
}
