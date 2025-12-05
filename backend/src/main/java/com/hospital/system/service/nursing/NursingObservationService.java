package com.hospital.system.service.nursing;

import com.hospital.system.dto.nursing.NursingObservationRequest;
import com.hospital.system.dto.nursing.NursingObservationResponse;
import com.hospital.system.model.nursing.NursingObservation;
import com.hospital.system.model.nursing.ObservationType;
import com.hospital.system.repository.nursing.NursingObservationRepository;
import com.hospital.system.repository.core.PatientRepository;
import com.hospital.system.repository.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NursingObservationService {

    private final NursingObservationRepository nursingObservationRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional
    public NursingObservationResponse createObservation(NursingObservationRequest request) {
        validatePatientExists(request.getPatientId());
        validateNurseExists(request.getNurseId());

        NursingObservation observation = NursingObservation.builder()
                .patientId(request.getPatientId())
                .nurseId(request.getNurseId())
                .observationType(request.getObservationType())
                .notes(request.getNotes())
                .build();

        NursingObservation savedObservation = nursingObservationRepository.save(observation);
        return mapToResponse(savedObservation);
    }

    @Transactional(readOnly = true)
    public List<NursingObservationResponse> getObservationsByPatient(Long patientId) {
        validatePatientExists(patientId);
        return nursingObservationRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<NursingObservationResponse> getObservationsByPatientAndType(
            Long patientId, ObservationType observationType) {
        validatePatientExists(patientId);
        return nursingObservationRepository
                .findByPatientIdAndObservationTypeOrderByCreatedAtDesc(patientId, observationType)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NursingObservationResponse getObservationById(Long id) {
        NursingObservation observation = nursingObservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nursing observation not found with id: " + id));
        return mapToResponse(observation);
    }

    private NursingObservationResponse mapToResponse(NursingObservation observation) {
        String patientName = patientRepository.findById(observation.getPatientId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse("Unknown");

        String nurseName = userRepository.findById(observation.getNurseId())
                .map(u -> u.getFirstName() != null && u.getLastName() != null 
                        ? u.getFirstName() + " " + u.getLastName() 
                        : u.getUsername())
                .orElse("Unknown");

        return NursingObservationResponse.builder()
                .id(observation.getId())
                .patientId(observation.getPatientId())
                .patientName(patientName)
                .nurseId(observation.getNurseId())
                .nurseName(nurseName)
                .observationType(observation.getObservationType())
                .notes(observation.getNotes())
                .createdAt(observation.getCreatedAt())
                .build();
    }

    private void validatePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
    }

    private void validateNurseExists(Long nurseId) {
        if (!userRepository.existsById(nurseId)) {
            throw new RuntimeException("Nurse not found with id: " + nurseId);
        }
    }
}
