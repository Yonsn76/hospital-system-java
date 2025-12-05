package com.hospital.system.repository.medical;

import com.hospital.system.model.medical.MedicalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalNoteRepository extends JpaRepository<MedicalNote, Long> {

    List<MedicalNote> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    Optional<MedicalNote> findByAppointmentId(Long appointmentId);

    List<MedicalNote> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    @Query("SELECT mn FROM MedicalNote mn WHERE mn.patientId = :patientId ORDER BY mn.createdAt DESC")
    List<MedicalNote> findAllByPatientIdChronological(@Param("patientId") Long patientId);

    boolean existsByAppointmentId(Long appointmentId);
}
