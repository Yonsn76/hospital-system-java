package com.hospital.system.service;

import com.hospital.system.dto.TriagePriorityRequest;
import com.hospital.system.dto.TriageRequest;
import com.hospital.system.dto.TriageResponse;
import com.hospital.system.dto.VitalSignsResponse;
import com.hospital.system.model.Triage;
import com.hospital.system.model.TriageStatus;
import com.hospital.system.repository.PatientRepository;
import com.hospital.system.repository.TriageRepository;
import com.hospital.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for triage management operations.
 * Requirements 8.1, 8.2, 8.3, 8.4, 8.5: Manage triage creation, priority assignment, and waiting list
 */
@Service
@RequiredArgsConstructor
public class TriageService {

    private final TriageRepository triageRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final VitalSignsService vitalSignsService;

    /**
     * Create a triage record for a patient.
     * Requirements 8.1: Allow recording of chief complaint and initial assessment
     */
    @Transactional
    public TriageResponse createTriage(TriageRequest request) {
        validatePatientExists(request.getPatientId());
        validateNurseExists(request.getNurseId());

        Triage triage = Triage.builder()
                .patientId(request.getPatientId())
                .nurseId(request.getNurseId())
                .chiefComplaint(request.getChiefComplaint())
                .initialAssessment(request.getInitialAssessment())
                .priorityLevel(request.getPriorityLevel())
                .recommendedDestination(request.getRecommendedDestination())
                .vitalSignsId(request.getVitalSignsId())
                .status(TriageStatus.WAITING)
                .build();

        // If priority is assigned, set triaged timestamp
        if (request.getPriorityLevel() != null) {
            triage.setTriagedAt(LocalDateTime.now());
        }

        Triage savedTriage = triageRepository.save(triage);
        return mapToResponse(savedTriage);
    }


    /**
     * Assign priority level to a triage record.
     * Requirements 8.2: Categorize using a 5-level scale
     * Requirements 8.3: Record priority level and recommended destination
     */
    @Transactional
    public TriageResponse assignPriority(Long triageId, TriagePriorityRequest request) {
        Triage triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new RuntimeException("Triage not found with id: " + triageId));

        triage.setPriorityLevel(request.getPriorityLevel());
        if (request.getRecommendedDestination() != null) {
            triage.setRecommendedDestination(request.getRecommendedDestination());
        }
        triage.setTriagedAt(LocalDateTime.now());

        Triage updatedTriage = triageRepository.save(triage);
        return mapToResponse(updatedTriage);
    }

    /**
     * Mark a triaged patient as attended.
     * Requirements 8.5: Update the triage status and record the attending time
     */
    @Transactional
    public TriageResponse markAsAttended(Long triageId) {
        Triage triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new RuntimeException("Triage not found with id: " + triageId));

        if (triage.getStatus() == TriageStatus.ATTENDED) {
            throw new RuntimeException("Triage is already marked as attended");
        }

        triage.setStatus(TriageStatus.ATTENDED);
        triage.setAttendedAt(LocalDateTime.now());

        Triage updatedTriage = triageRepository.save(triage);
        return mapToResponse(updatedTriage);
    }

    /**
     * Mark a triaged patient as in progress.
     */
    @Transactional
    public TriageResponse markAsInProgress(Long triageId) {
        Triage triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new RuntimeException("Triage not found with id: " + triageId));

        if (triage.getStatus() != TriageStatus.WAITING) {
            throw new RuntimeException("Can only mark WAITING triage as IN_PROGRESS");
        }

        triage.setStatus(TriageStatus.IN_PROGRESS);

        Triage updatedTriage = triageRepository.save(triage);
        return mapToResponse(updatedTriage);
    }

    /**
     * Mark a triaged patient as left (without being attended).
     */
    @Transactional
    public TriageResponse markAsLeft(Long triageId) {
        Triage triage = triageRepository.findById(triageId)
                .orElseThrow(() -> new RuntimeException("Triage not found with id: " + triageId));

        if (triage.getStatus() == TriageStatus.ATTENDED) {
            throw new RuntimeException("Cannot mark attended triage as left");
        }

        triage.setStatus(TriageStatus.LEFT);

        Triage updatedTriage = triageRepository.save(triage);
        return mapToResponse(updatedTriage);
    }

    /**
     * Get the waiting list ordered by priority level (1-5 ascending) and arrival time (ascending).
     * Requirements 8.4: Display patients ordered by priority level and arrival time
     * Priority ordering: RESUSCITATION(1) > EMERGENT(2) > URGENT(3) > LESS_URGENT(4) > NON_URGENT(5)
     */
    @Transactional(readOnly = true)
    public List<TriageResponse> getWaitingList() {
        return triageRepository.findWaitingListOrdered()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get triage records by status ordered by priority level and arrival time.
     * Requirements 8.4: Display patients ordered by priority level and arrival time
     */
    @Transactional(readOnly = true)
    public List<TriageResponse> getTriageByStatusOrdered(TriageStatus status) {
        return triageRepository.findByStatusOrderedByPriorityAndArrival(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get triage by ID.
     */
    @Transactional(readOnly = true)
    public TriageResponse getTriageById(Long id) {
        Triage triage = triageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Triage not found with id: " + id));
        return mapToResponse(triage);
    }

    /**
     * Get all triage records for a patient.
     */
    @Transactional(readOnly = true)
    public List<TriageResponse> getTriageByPatient(Long patientId) {
        validatePatientExists(patientId);
        return triageRepository.findByPatientIdOrderByArrivedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get triage records by status.
     */
    @Transactional(readOnly = true)
    public List<TriageResponse> getTriageByStatus(TriageStatus status) {
        return triageRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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

    private TriageResponse mapToResponse(Triage triage) {
        TriageResponse response = TriageResponse.builder()
                .id(triage.getId())
                .patientId(triage.getPatientId())
                .nurseId(triage.getNurseId())
                .chiefComplaint(triage.getChiefComplaint())
                .initialAssessment(triage.getInitialAssessment())
                .priorityLevel(triage.getPriorityLevel())
                .priorityLevelValue(triage.getPriorityLevel() != null ? triage.getPriorityLevel().getLevel() : null)
                .recommendedDestination(triage.getRecommendedDestination())
                .vitalSignsId(triage.getVitalSignsId())
                .status(triage.getStatus())
                .arrivedAt(triage.getArrivedAt())
                .triagedAt(triage.getTriagedAt())
                .attendedAt(triage.getAttendedAt())
                .build();

        // Include vital signs if available
        if (triage.getVitalSignsId() != null) {
            try {
                VitalSignsResponse vitalSigns = vitalSignsService.getVitalSignsById(triage.getVitalSignsId());
                response.setVitalSigns(vitalSigns);
            } catch (Exception e) {
                // Vital signs may have been deleted, ignore
            }
        }

        return response;
    }
}
