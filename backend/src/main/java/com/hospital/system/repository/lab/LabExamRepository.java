package com.hospital.system.repository.lab;

import com.hospital.system.model.lab.ExamStatus;
import com.hospital.system.model.lab.LabExam;
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
