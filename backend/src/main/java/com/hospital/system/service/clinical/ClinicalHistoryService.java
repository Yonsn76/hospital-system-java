package com.hospital.system.service.clinical;

import com.hospital.system.dto.clinical.*;
import com.hospital.system.dto.patient.*;
import com.hospital.system.model.clinical.ClinicalHistory;
import com.hospital.system.repository.clinical.*;
import com.hospital.system.repository.core.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalHistoryService {

    private final ClinicalHistoryRepository clinicalHistoryRepository;
    private final AllergyRepository allergyRepository;
    private final ChronicDiseaseRepository chronicDiseaseRepository;
    private final ClinicalEvolutionRepository clinicalEvolutionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public ClinicalHistoryResponse getClinicalHistory(Long patientId) {
        validatePatientExists(patientId);
        
        ClinicalHistory history = clinicalHistoryRepository.findByPatientId(patientId)
                .orElseGet(() -> createEmptyClinicalHistory(patientId));
        
        return buildFullClinicalHistoryResponse(history);
    }

    @Transactional
    public ClinicalHistoryResponse updateClinicalHistory(Long patientId, ClinicalHistoryRequest request) {
        validatePatientExists(patientId);
        
        ClinicalHistory history = clinicalHistoryRepository.findByPatientId(patientId)
                .orElseGet(() -> {
                    ClinicalHistory newHistory = ClinicalHistory.builder()
                            .patientId(patientId)
                            .build();
                    return clinicalHistoryRepository.save(newHistory);
                });
        
        history.setAntecedentes(request.getAntecedentes());
        history.setObservaciones(request.getObservaciones());
        
        ClinicalHistory savedHistory = clinicalHistoryRepository.save(history);
        return buildFullClinicalHistoryResponse(savedHistory);
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> searchPatientsByCondition(String condition) {
        Set<Long> patientIds = new HashSet<>();
        
        // Search in chronic diseases
        patientIds.addAll(chronicDiseaseRepository.findPatientIdsByCondition(condition));
        
        // Search in evolution notes
        patientIds.addAll(clinicalEvolutionRepository.findPatientIdsByConditionInNotes(condition));
        
        // Search in clinical history antecedentes and observaciones
        clinicalHistoryRepository.findAll().stream()
                .filter(h -> containsCondition(h, condition))
                .map(ClinicalHistory::getPatientId)
                .forEach(patientIds::add);
        
        return patientIds.stream()
                .map(id -> patientRepository.findById(id).orElse(null))
                .filter(p -> p != null)
                .map(this::mapToPatientResponse)
                .collect(Collectors.toList());
    }

    private ClinicalHistory createEmptyClinicalHistory(Long patientId) {
        ClinicalHistory history = ClinicalHistory.builder()
                .patientId(patientId)
                .build();
        return clinicalHistoryRepository.save(history);
    }

    private ClinicalHistoryResponse buildFullClinicalHistoryResponse(ClinicalHistory history) {
        List<AllergyResponse> allergies = allergyRepository.findByPatientId(history.getPatientId())
                .stream()
                .map(this::mapToAllergyResponse)
                .collect(Collectors.toList());
        
        List<ChronicDiseaseResponse> chronicDiseases = chronicDiseaseRepository.findByPatientId(history.getPatientId())
                .stream()
                .map(this::mapToChronicDiseaseResponse)
                .collect(Collectors.toList());
        
        List<ClinicalEvolutionResponse> evolutions = clinicalEvolutionRepository.findByPatientIdOrderByCreatedAtDesc(history.getPatientId())
                .stream()
                .map(this::mapToEvolutionResponse)
                .collect(Collectors.toList());
        
        return ClinicalHistoryResponse.builder()
                .id(history.getId())
                .patientId(history.getPatientId())
                .antecedentes(history.getAntecedentes())
                .observaciones(history.getObservaciones())
                .allergies(allergies)
                .chronicDiseases(chronicDiseases)
                .evolutions(evolutions)
                .createdAt(history.getCreatedAt())
                .updatedAt(history.getUpdatedAt())
                .build();
    }

    private boolean containsCondition(ClinicalHistory history, String condition) {
        String lowerCondition = condition.toLowerCase();
        return (history.getAntecedentes() != null && history.getAntecedentes().toLowerCase().contains(lowerCondition))
                || (history.getObservaciones() != null && history.getObservaciones().toLowerCase().contains(lowerCondition));
    }

    private void validatePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
    }

    private AllergyResponse mapToAllergyResponse(com.hospital.system.model.clinical.Allergy allergy) {
        return AllergyResponse.builder()
                .id(allergy.getId())
                .patientId(allergy.getPatientId())
                .allergyName(allergy.getAllergyName())
                .severity(allergy.getSeverity())
                .notes(allergy.getNotes())
                .createdAt(allergy.getCreatedAt())
                .build();
    }

    private ChronicDiseaseResponse mapToChronicDiseaseResponse(com.hospital.system.model.clinical.ChronicDisease disease) {
        return ChronicDiseaseResponse.builder()
                .id(disease.getId())
                .patientId(disease.getPatientId())
                .diseaseName(disease.getDiseaseName())
                .diagnosisDate(disease.getDiagnosisDate())
                .status(disease.getStatus())
                .notes(disease.getNotes())
                .createdAt(disease.getCreatedAt())
                .updatedAt(disease.getUpdatedAt())
                .build();
    }

    private ClinicalEvolutionResponse mapToEvolutionResponse(com.hospital.system.model.clinical.ClinicalEvolution evolution) {
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

    private PatientResponse mapToPatientResponse(com.hospital.system.model.core.Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .contactNumber(patient.getContactNumber())
                .address(patient.getAddress())
                .build();
    }
}
