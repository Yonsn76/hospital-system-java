package com.hospital.system.service;

import com.hospital.system.dto.ReferralRequest;
import com.hospital.system.dto.ReferralResponse;
import com.hospital.system.dto.ReferralStatusUpdateRequest;
import com.hospital.system.model.Referral;
import com.hospital.system.model.ReferralStatus;
import com.hospital.system.repository.DoctorRepository;
import com.hospital.system.repository.PatientRepository;
import com.hospital.system.repository.ReferralRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for referral management operations.
 * Requirements 9.1, 9.2, 9.3, 9.4, 9.5: Manage referral creation, status lifecycle, and queries
 */
@Service
@RequiredArgsConstructor
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    /**
     * Create a referral for a patient.
     * Requirements 9.1: Create referral with destination, reason, and urgency
     */
    @Transactional
    public ReferralResponse createReferral(ReferralRequest request) {
        validatePatientExists(request.getPatientId());
        validateDoctorExists(request.getReferringDoctorId());
        
        if (request.getDestinationDoctorId() != null) {
            validateDoctorExists(request.getDestinationDoctorId());
        }

        // Validate that at least one destination is provided
        if (request.getDestinationDoctorId() == null && 
            request.getDestinationSpecialty() == null && 
            request.getExternalService() == null) {
            throw new RuntimeException("At least one destination (doctor, specialty, or external service) is required");
        }

        Referral referral = Referral.builder()
                .patientId(request.getPatientId())
                .referringDoctorId(request.getReferringDoctorId())
                .destinationDoctorId(request.getDestinationDoctorId())
                .destinationSpecialty(request.getDestinationSpecialty())
                .externalService(request.getExternalService())
                .reason(request.getReason())
                .urgency(request.getUrgency())
                .status(ReferralStatus.PENDING)
                .build();

        Referral savedReferral = referralRepository.save(referral);
        return mapToResponse(savedReferral);
    }


    /**
     * Accept a referral.
     * Requirements 9.3: Update referral status
     * Valid transition: PENDING → ACCEPTED
     */
    @Transactional
    public ReferralResponse acceptReferral(Long referralId) {
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new RuntimeException("Referral not found with id: " + referralId));

        if (referral.getStatus() != ReferralStatus.PENDING) {
            throw new RuntimeException("Can only accept referrals with PENDING status. Current status: " + referral.getStatus());
        }

        referral.setStatus(ReferralStatus.ACCEPTED);
        Referral updatedReferral = referralRepository.save(referral);
        return mapToResponse(updatedReferral);
    }

    /**
     * Complete a referral with optional appointment link.
     * Requirements 9.3: Update referral status and link resulting consultation
     * Valid transition: ACCEPTED → COMPLETED
     */
    @Transactional
    public ReferralResponse completeReferral(Long referralId, Long resultingAppointmentId) {
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new RuntimeException("Referral not found with id: " + referralId));

        if (referral.getStatus() != ReferralStatus.ACCEPTED) {
            throw new RuntimeException("Can only complete referrals with ACCEPTED status. Current status: " + referral.getStatus());
        }

        referral.setStatus(ReferralStatus.COMPLETED);
        referral.setCompletedAt(LocalDateTime.now());
        if (resultingAppointmentId != null) {
            referral.setResultingAppointmentId(resultingAppointmentId);
        }

        Referral updatedReferral = referralRepository.save(referral);
        return mapToResponse(updatedReferral);
    }

    /**
     * Cancel a referral.
     * Requirements 9.3: Update referral status
     * Valid transition: PENDING → CANCELLED
     */
    @Transactional
    public ReferralResponse cancelReferral(Long referralId) {
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new RuntimeException("Referral not found with id: " + referralId));

        if (referral.getStatus() != ReferralStatus.PENDING) {
            throw new RuntimeException("Can only cancel referrals with PENDING status. Current status: " + referral.getStatus());
        }

        referral.setStatus(ReferralStatus.CANCELLED);
        Referral updatedReferral = referralRepository.save(referral);
        return mapToResponse(updatedReferral);
    }

    /**
     * Update referral status with optional appointment link.
     * Requirements 9.3: Update referral status and link resulting consultation
     */
    @Transactional
    public ReferralResponse updateReferralStatus(Long referralId, ReferralStatusUpdateRequest request) {
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new RuntimeException("Referral not found with id: " + referralId));

        validateStatusTransition(referral.getStatus(), request.getStatus());

        referral.setStatus(request.getStatus());
        
        if (request.getStatus() == ReferralStatus.COMPLETED) {
            referral.setCompletedAt(LocalDateTime.now());
            if (request.getResultingAppointmentId() != null) {
                referral.setResultingAppointmentId(request.getResultingAppointmentId());
            }
        }

        Referral updatedReferral = referralRepository.save(referral);
        return mapToResponse(updatedReferral);
    }

    /**
     * Get referral by ID.
     */
    @Transactional(readOnly = true)
    public ReferralResponse getReferralById(Long id) {
        Referral referral = referralRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Referral not found with id: " + id));
        return mapToResponse(referral);
    }

    /**
     * Get all referrals for a patient.
     * Requirements 9.4: View patient's referral history with current status
     */
    @Transactional(readOnly = true)
    public List<ReferralResponse> getReferralsByPatient(Long patientId) {
        validatePatientExists(patientId);
        return referralRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending referrals for a destination doctor.
     * Requirements 9.5: Display pending referrals in doctor's list
     */
    @Transactional(readOnly = true)
    public List<ReferralResponse> getPendingReferralsForDoctor(Long doctorId) {
        validateDoctorExists(doctorId);
        return referralRepository.findPendingReferralsForDoctor(doctorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all referrals created by a referring doctor.
     */
    @Transactional(readOnly = true)
    public List<ReferralResponse> getReferralsByReferringDoctor(Long doctorId) {
        validateDoctorExists(doctorId);
        return referralRepository.findByReferringDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Validate status transition follows allowed lifecycle.
     * Valid transitions: PENDING → ACCEPTED → COMPLETED, or PENDING → CANCELLED
     */
    private void validateStatusTransition(ReferralStatus currentStatus, ReferralStatus newStatus) {
        boolean validTransition = switch (currentStatus) {
            case PENDING -> newStatus == ReferralStatus.ACCEPTED || newStatus == ReferralStatus.CANCELLED;
            case ACCEPTED -> newStatus == ReferralStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };

        if (!validTransition) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
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

    private ReferralResponse mapToResponse(Referral referral) {
        return ReferralResponse.builder()
                .id(referral.getId())
                .patientId(referral.getPatientId())
                .referringDoctorId(referral.getReferringDoctorId())
                .destinationDoctorId(referral.getDestinationDoctorId())
                .destinationSpecialty(referral.getDestinationSpecialty())
                .externalService(referral.getExternalService())
                .reason(referral.getReason())
                .urgency(referral.getUrgency())
                .status(referral.getStatus())
                .resultingAppointmentId(referral.getResultingAppointmentId())
                .createdAt(referral.getCreatedAt())
                .completedAt(referral.getCompletedAt())
                .build();
    }
}
