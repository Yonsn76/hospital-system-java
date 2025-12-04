package com.hospital.system.repository;

import com.hospital.system.model.ExamStatus;
import com.hospital.system.model.LabExam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabExamRepository extends JpaRepository<LabExam, Long> {

    List<LabExam> findByPatientIdOrderByRequestedAtDesc(Long patientId);

    List<LabExam> findByRequestingDoctorIdAndStatusOrderByRequestedAtDesc(Long doctorId, ExamStatus status);

    List<LabExam> findByAppointmentIdOrderByRequestedAtDesc(Long appointmentId);

    List<LabExam> findByPatientIdAndStatusOrderByRequestedAtDesc(Long patientId, ExamStatus status);
}
