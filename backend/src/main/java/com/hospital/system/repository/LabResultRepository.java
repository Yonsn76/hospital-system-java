package com.hospital.system.repository;

import com.hospital.system.model.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    List<LabResult> findByLabExamIdOrderByUploadedAtDesc(Long labExamId);

    List<LabResult> findByLabExamIdAndIsAbnormalTrue(Long labExamId);
}
