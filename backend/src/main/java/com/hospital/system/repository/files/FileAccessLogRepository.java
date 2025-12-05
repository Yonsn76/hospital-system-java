package com.hospital.system.repository.files;

import com.hospital.system.model.auth.AccessAction;
import com.hospital.system.model.files.FileAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FileAccessLogRepository extends JpaRepository<FileAccessLog, Long> {
    
    List<FileAccessLog> findByClinicalFileId(Long clinicalFileId);
    
    List<FileAccessLog> findByUserId(Long userId);
    
    List<FileAccessLog> findByClinicalFileIdAndAction(Long clinicalFileId, AccessAction action);
    
    List<FileAccessLog> findByClinicalFileIdOrderByAccessedAtDesc(Long clinicalFileId);
    
    List<FileAccessLog> findByAccessedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
