package com.hospital.system.service.clinical;

import com.hospital.system.dto.clinical.AllergyRequest;
import com.hospital.system.dto.clinical.AllergyResponse;
import com.hospital.system.model.clinical.Allergy;
import com.hospital.system.model.clinical.AllergySeverity;
import com.hospital.system.repository.clinical.AllergyRepository;
import com.hospital.system.repository.core.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllergyService {

    private final AllergyRepository allergyRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public AllergyResponse addAllergy(Long patientId, AllergyRequest request) {
        validatePatientExists(patientId);
        
        if (allergyRepository.existsByPatientIdAndAllergyNameIgnoreCase(patientId, request.getAllergyName())) {
            throw new RuntimeException("Allergy already registered for this patient: " + request.getAllergyName());
        }
        
        Allergy allergy = Allergy.builder()
                .patientId(patientId)
                .allergyName(request.getAllergyName())
                .severity(request.getSeverity())
                .notes(request.getNotes())
                .build();
        
        Allergy savedAllergy = allergyRepository.save(allergy);
        return mapToResponse(savedAllergy);
    }

    @Transactional(readOnly = true)
    public List<AllergyResponse> getAllergiesByPatient(Long patientId) {
        validatePatientExists(patientId);
        return allergyRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AllergyResponse> getAllergiesByPatientAndSeverity(Long patientId, AllergySeverity severity) {
        validatePatientExists(patientId);
        return allergyRepository.findByPatientIdAndSeverity(patientId, severity)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AllergyResponse getAllergyById(Long allergyId) {
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new RuntimeException("Allergy not found with id: " + allergyId));
        return mapToResponse(allergy);
    }

    @Transactional
    public AllergyResponse updateAllergy(Long patientId, Long allergyId, AllergyRequest request) {
        validatePatientExists(patientId);
        
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new RuntimeException("Allergy not found with id: " + allergyId));
        
        if (!allergy.getPatientId().equals(patientId)) {
            throw new RuntimeException("Allergy does not belong to patient with id: " + patientId);
        }
        
        allergy.setAllergyName(request.getAllergyName());
        allergy.setSeverity(request.getSeverity());
        allergy.setNotes(request.getNotes());
        
        Allergy updatedAllergy = allergyRepository.save(allergy);
        return mapToResponse(updatedAllergy);
    }

    @Transactional
    public void deleteAllergy(Long patientId, Long allergyId) {
        validatePatientExists(patientId);
        
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new RuntimeException("Allergy not found with id: " + allergyId));
        
        if (!allergy.getPatientId().equals(patientId)) {
            throw new RuntimeException("Allergy does not belong to patient with id: " + patientId);
        }
        
        allergyRepository.delete(allergy);
    }

    private void validatePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
    }

    private AllergyResponse mapToResponse(Allergy allergy) {
        return AllergyResponse.builder()
                .id(allergy.getId())
                .patientId(allergy.getPatientId())
                .allergyName(allergy.getAllergyName())
                .severity(allergy.getSeverity())
                .notes(allergy.getNotes())
                .createdAt(allergy.getCreatedAt())
                .build();
    }
}
