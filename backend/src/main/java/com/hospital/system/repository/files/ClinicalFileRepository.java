package com.hospital.system.repository.files;

import com.hospital.system.model.files.ClinicalFile;
import com.hospital.system.model.files.FileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClinicalFileRepository extends JpaRepository<ClinicalFile, Long> {
    
    List<ClinicalFile> findByPatientId(Long patientId);
    
    List<ClinicalFile> findByPatientIdAndFileType(Long patientId, FileType fileType);
    
    List<ClinicalFile> findByPatientIdOrderByUploadedAtDesc(Long patientId);
    
    @Query("SELECT cf FROM ClinicalFile cf WHERE cf.patientId = :patientId " +
           "AND cf.uploadedAt BETWEEN :startDate AND :endDate ORDER BY cf.uploadedAt DESC")
    List<ClinicalFile> findByPatientIdAndDateRange(
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT cf FROM ClinicalFile cf WHERE cf.patientId = :patientId " +
           "AND (:fileType IS NULL OR cf.fileType = :fileType) " +
           "AND (:startDate IS NULL OR cf.uploadedAt >= :startDate) " +
           "AND (:endDate IS NULL OR cf.uploadedAt <= :endDate) " +
           "ORDER BY cf.uploadedAt DESC")
    List<ClinicalFile> searchFiles(
            @Param("patientId") Long patientId,
            @Param("fileType") FileType fileType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
