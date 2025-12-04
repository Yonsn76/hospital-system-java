package com.hospital.system.repository;

import com.hospital.system.model.Prescription;
import com.hospital.system.model.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Prescription> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, PrescriptionStatus status);

    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    List<Prescription> findByAppointmentId(Long appointmentId);
}
