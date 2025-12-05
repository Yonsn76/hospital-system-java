package com.hospital.system.service.clinical;

import com.hospital.system.dto.clinical.ClinicalEvolutionRequest;
import com.hospital.system.dto.clinical.ClinicalEvolutionResponse;
import com.hospital.system.model.clinical.ClinicalEvolution;
import com.hospital.system.repository.appointment.AppointmentRepository;
import com.hospital.system.repository.clinical.ClinicalEvolutionRepository;
import com.hospital.system.repository.core.DoctorRepository;
import com.hospital.system.repository.core.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalEvolutionService {

    private final ClinicalEvolutionRepository clinicalEvolutionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public ClinicalEvolutionResponse addEvolution(Long patientId, ClinicalEvolutionRequest request) {
        validatePatientExists(patientId);
        validateDoctorExists(request.getDoctorId());
        
        if (request.getAppointmentId() != null) {
            validateAppointmentExists(request.getAppointmentId());
            validateAppointmentBelongsToPatient(request.getAppointmentId(), patientId);
        }
        
        ClinicalEvolution evolution = ClinicalEvolution.builder()
                .patientId(patientId)
                .appointmentId(request.getAppointmentId())
                .doctorId(request.getDoctorId())
                .evolutionNotes(request.getEvolutionNotes())
                .build();
        
        ClinicalEvolution savedEvolution = clinicalEvolutionRepository.save(evolution);
        return mapToResponse(savedEvolution);
    }

    @Transactional(readOnly = true)
    public List<ClinicalEvolutionResponse> getEvolutionsByPatient(Long patientId) {
        validatePatientExists(patientId);
        return clinicalEvolutionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClinicalEvolutionResponse> getEvolutionsByDoctor(Long doctorId) {
        validateDoctorExists(doctorId);
        return clinicalEvolutionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClinicalEvolutionResponse getEvolutionById(Long evolutionId) {
        ClinicalEvolution evolution = clinicalEvolutionRepository.findById(evolutionId)
                .orElseThrow(() -> new RuntimeException("Clinical evolution not found with id: " + evolutionId));
        return mapToResponse(evolution);
    }

    @Transactional(readOnly = true)
    public ClinicalEvolutionResponse getEvolutionByAppointment(Long appointmentId) {
        ClinicalEvolution evolution = clinicalEvolutionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Clinical evolution not found for appointment id: " + appointmentId));
        return mapToResponse(evolution);
    }

    @Transactional
    public ClinicalEvolutionResponse updateEvolution(Long patientId, Long evolutionId, ClinicalEvolutionRequest request) {
        validatePatientExists(patientId);
        
        ClinicalEvolution evolution = clinicalEvolutionRepository.findById(evolutionId)
                .orElseThrow(() -> new RuntimeException("Clinical evolution not found with id: " + evolutionId));
        
        if (!evolution.getPatientId().equals(patientId)) {
            throw new RuntimeException("Clinical evolution does not belong to patient with id: " + patientId);
        }
        
        evolution.setEvolutionNotes(request.getEvolutionNotes());
        
        ClinicalEvolution updatedEvolution = clinicalEvolutionRepository.save(evolution);
        return mapToResponse(updatedEvolution);
    }

    private void validatePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
    }

    private void validateDoctorExists(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new RuntimeException("Doctor not found with id: " + doctorId);
        }
    }

    private void validateAppointmentExists(Long appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new RuntimeException("Appointment not found with id: " + appointmentId);
        }
    }

    private void validateAppointmentBelongsToPatient(Long appointmentId, Long patientId) {
        appointmentRepository.findById(appointmentId)
                .filter(apt -> apt.getPatient().getId().equals(patientId))
                .orElseThrow(() -> new RuntimeException("Appointment does not belong to patient with id: " + patientId));
    }

    private ClinicalEvolutionResponse mapToResponse(ClinicalEvolution evolution) {
        String doctorName = doctorRepository.findById(evolution.getDoctorId())
                .map(d -> d.getUser() != null ? d.getUser().getUsername() : "Unknown")
                .orElse("Unknown");
        
        return ClinicalEvolutionResponse.builder()
                .id(evolution.getId())
                .patientId(evolution.getPatientId())
                .appointmentId(evolution.getAppointmentId())
                .doctorId(evolution.getDoctorId())
                .doctorName(doctorName)
                .evolutionNotes(evolution.getEvolutionNotes())
                .createdAt(evolution.getCreatedAt())
                .build();
    }
}
