package com.hospital.system.controller;

import com.hospital.system.dto.*;
import com.hospital.system.model.AllergySeverity;
import com.hospital.system.model.DiseaseStatus;
import com.hospital.system.service.AllergyService;
import com.hospital.system.service.ChronicDiseaseService;
import com.hospital.system.service.ClinicalEvolutionService;
import com.hospital.system.service.ClinicalHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class ClinicalHistoryController {

    private final ClinicalHistoryService clinicalHistoryService;
    private final AllergyService allergyService;
    private final ChronicDiseaseService chronicDiseaseService;
    private final ClinicalEvolutionService clinicalEvolutionService;

    // ==================== Clinical History Endpoints ====================

    @GetMapping("/{patientId}/clinical-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<ClinicalHistoryResponse> getClinicalHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalHistoryService.getClinicalHistory(patientId));
    }

    @PutMapping("/{patientId}/clinical-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ClinicalHistoryResponse> updateClinicalHistory(
            @PathVariable Long patientId,
            @RequestBody ClinicalHistoryRequest request) {
        return ResponseEntity.ok(clinicalHistoryService.updateClinicalHistory(patientId, request));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<PatientResponse>> searchPatientsByCondition(
            @RequestParam String condition) {
        return ResponseEntity.ok(clinicalHistoryService.searchPatientsByCondition(condition));
    }

    // ==================== Allergy Endpoints ====================

    @PostMapping("/{patientId}/allergies")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<AllergyResponse> addAllergy(
            @PathVariable Long patientId,
            @Valid @RequestBody AllergyRequest request) {
        return ResponseEntity.ok(allergyService.addAllergy(patientId, request));
    }

    @GetMapping("/{patientId}/allergies")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<AllergyResponse>> getAllergies(@PathVariable Long patientId) {
        return ResponseEntity.ok(allergyService.getAllergiesByPatient(patientId));
    }

    @GetMapping("/{patientId}/allergies/severity/{severity}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<AllergyResponse>> getAllergiesBySeverity(
            @PathVariable Long patientId,
            @PathVariable AllergySeverity severity) {
        return ResponseEntity.ok(allergyService.getAllergiesByPatientAndSeverity(patientId, severity));
    }

    @PutMapping("/{patientId}/allergies/{allergyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<AllergyResponse> updateAllergy(
            @PathVariable Long patientId,
            @PathVariable Long allergyId,
            @Valid @RequestBody AllergyRequest request) {
        return ResponseEntity.ok(allergyService.updateAllergy(patientId, allergyId, request));
    }

    @DeleteMapping("/{patientId}/allergies/{allergyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Void> deleteAllergy(
            @PathVariable Long patientId,
            @PathVariable Long allergyId) {
        allergyService.deleteAllergy(patientId, allergyId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Chronic Disease Endpoints ====================

    @PostMapping("/{patientId}/chronic-diseases")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ChronicDiseaseResponse> addChronicDisease(
            @PathVariable Long patientId,
            @Valid @RequestBody ChronicDiseaseRequest request) {
        return ResponseEntity.ok(chronicDiseaseService.addChronicDisease(patientId, request));
    }

    @GetMapping("/{patientId}/chronic-diseases")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<ChronicDiseaseResponse>> getChronicDiseases(@PathVariable Long patientId) {
        return ResponseEntity.ok(chronicDiseaseService.getChronicDiseasesByPatient(patientId));
    }

    @GetMapping("/{patientId}/chronic-diseases/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<ChronicDiseaseResponse>> getChronicDiseasesByStatus(
            @PathVariable Long patientId,
            @PathVariable DiseaseStatus status) {
        return ResponseEntity.ok(chronicDiseaseService.getChronicDiseasesByPatientAndStatus(patientId, status));
    }

    @PutMapping("/{patientId}/chronic-diseases/{diseaseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ChronicDiseaseResponse> updateChronicDisease(
            @PathVariable Long patientId,
            @PathVariable Long diseaseId,
            @Valid @RequestBody ChronicDiseaseRequest request) {
        return ResponseEntity.ok(chronicDiseaseService.updateChronicDisease(patientId, diseaseId, request));
    }

    @PutMapping("/{patientId}/chronic-diseases/{diseaseId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ChronicDiseaseResponse> updateDiseaseStatus(
            @PathVariable Long patientId,
            @PathVariable Long diseaseId,
            @RequestParam DiseaseStatus status) {
        return ResponseEntity.ok(chronicDiseaseService.updateDiseaseStatus(patientId, diseaseId, status));
    }

    @DeleteMapping("/{patientId}/chronic-diseases/{diseaseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Void> deleteChronicDisease(
            @PathVariable Long patientId,
            @PathVariable Long diseaseId) {
        chronicDiseaseService.deleteChronicDisease(patientId, diseaseId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Clinical Evolution Endpoints ====================

    @PostMapping("/{patientId}/evolutions")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ClinicalEvolutionResponse> addEvolution(
            @PathVariable Long patientId,
            @Valid @RequestBody ClinicalEvolutionRequest request) {
        return ResponseEntity.ok(clinicalEvolutionService.addEvolution(patientId, request));
    }

    @GetMapping("/{patientId}/evolutions")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<List<ClinicalEvolutionResponse>> getEvolutions(@PathVariable Long patientId) {
        return ResponseEntity.ok(clinicalEvolutionService.getEvolutionsByPatient(patientId));
    }

    @GetMapping("/{patientId}/evolutions/{evolutionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    public ResponseEntity<ClinicalEvolutionResponse> getEvolutionById(
            @PathVariable Long patientId,
            @PathVariable Long evolutionId) {
        return ResponseEntity.ok(clinicalEvolutionService.getEvolutionById(evolutionId));
    }

    @PutMapping("/{patientId}/evolutions/{evolutionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ClinicalEvolutionResponse> updateEvolution(
            @PathVariable Long patientId,
            @PathVariable Long evolutionId,
            @Valid @RequestBody ClinicalEvolutionRequest request) {
        return ResponseEntity.ok(clinicalEvolutionService.updateEvolution(patientId, evolutionId, request));
    }
}
