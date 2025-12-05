package com.hospital.system.service.clinical;

import com.hospital.system.dto.clinical.ChronicDiseaseRequest;
import com.hospital.system.dto.clinical.ChronicDiseaseResponse;
import com.hospital.system.model.clinical.ChronicDisease;
import com.hospital.system.model.clinical.DiseaseStatus;
import com.hospital.system.repository.clinical.ChronicDiseaseRepository;
import com.hospital.system.repository.core.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChronicDiseaseService {

    private final ChronicDiseaseRepository chronicDiseaseRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public ChronicDiseaseResponse addChronicDisease(Long patientId, ChronicDiseaseRequest request) {
        validatePatientExists(patientId);
        
        ChronicDisease disease = ChronicDisease.builder()
                .patientId(patientId)
                .diseaseName(request.getDiseaseName())
                .diagnosisDate(request.getDiagnosisDate())
                .status(request.getStatus())
                .notes(request.getNotes())
                .build();
        
        ChronicDisease savedDisease = chronicDiseaseRepository.save(disease);
        return mapToResponse(savedDisease);
    }

    @Transactional(readOnly = true)
    public List<ChronicDiseaseResponse> getChronicDiseasesByPatient(Long patientId) {
        validatePatientExists(patientId);
        return chronicDiseaseRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChronicDiseaseResponse> getChronicDiseasesByPatientAndStatus(Long patientId, DiseaseStatus status) {
        validatePatientExists(patientId);
        return chronicDiseaseRepository.findByPatientIdAndStatus(patientId, status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChronicDiseaseResponse getChronicDiseaseById(Long diseaseId) {
        ChronicDisease disease = chronicDiseaseRepository.findById(diseaseId)
                .orElseThrow(() -> new RuntimeException("Chronic disease not found with id: " + diseaseId));
        return mapToResponse(disease);
    }

    @Transactional
    public ChronicDiseaseResponse updateChronicDisease(Long patientId, Long diseaseId, ChronicDiseaseRequest request) {
        validatePatientExists(patientId);
        
        ChronicDisease disease = chronicDiseaseRepository.findById(diseaseId)
                .orElseThrow(() -> new RuntimeException("Chronic disease not found with id: " + diseaseId));
        
        if (!disease.getPatientId().equals(patientId)) {
            throw new RuntimeException("Chronic disease does not belong to patient with id: " + patientId);
        }
        
        disease.setDiseaseName(request.getDiseaseName());
        disease.setDiagnosisDate(request.getDiagnosisDate());
        disease.setStatus(request.getStatus());
        disease.setNotes(request.getNotes());
        
        ChronicDisease updatedDisease = chronicDiseaseRepository.save(disease);
        return mapToResponse(updatedDisease);
    }

    @Transactional
    public ChronicDiseaseResponse updateDiseaseStatus(Long patientId, Long diseaseId, DiseaseStatus newStatus) {
        validatePatientExists(patientId);
        
        ChronicDisease disease = chronicDiseaseRepository.findById(diseaseId)
                .orElseThrow(() -> new RuntimeException("Chronic disease not found with id: " + diseaseId));
        
        if (!disease.getPatientId().equals(patientId)) {
            throw new RuntimeException("Chronic disease does not belong to patient with id: " + patientId);
        }
        
        disease.setStatus(newStatus);
        ChronicDisease updatedDisease = chronicDiseaseRepository.save(disease);
        return mapToResponse(updatedDisease);
    }

    @Transactional
    public void deleteChronicDisease(Long patientId, Long diseaseId) {
        validatePatientExists(patientId);
        
        ChronicDisease disease = chronicDiseaseRepository.findById(diseaseId)
                .orElseThrow(() -> new RuntimeException("Chronic disease not found with id: " + diseaseId));
        
        if (!disease.getPatientId().equals(patientId)) {
            throw new RuntimeException("Chronic disease does not belong to patient with id: " + patientId);
        }
        
        chronicDiseaseRepository.delete(disease);
    }

    private void validatePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException("Patient not found with id: " + patientId);
        }
    }

    private ChronicDiseaseResponse mapToResponse(ChronicDisease disease) {
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
}
