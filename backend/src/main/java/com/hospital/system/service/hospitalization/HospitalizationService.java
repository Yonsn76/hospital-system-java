package com.hospital.system.service.hospitalization;

import com.hospital.system.dto.hospitalization.*;
import com.hospital.system.model.hospitalization.*;
import com.hospital.system.repository.hospitalization.BedTransferRepository;
import com.hospital.system.repository.hospitalization.HospitalizationRepository;
import com.hospital.system.repository.core.PatientRepository;
import com.hospital.system.repository.core.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for hospitalization management operations.
 * Requirements 7.1, 7.2, 7.3, 7.4, 7.6: Manage admissions, bed assignments, transfers, and discharges
 */
@Service
@RequiredArgsConstructor
public class HospitalizationService {

    private final HospitalizationRepository hospitalizationRepository;
    private final BedTransferRepository bedTransferRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final BedService bedService;


    /**
     * Admit a patient to the hospital.
     * Requirements 7.1: Create hospitalization record with admission date, reason, and admitting doctor
     */
    @Transactional
    public HospitalizationResponse admitPatient(HospitalizationRequest request) {
        validatePatientExists(request.getPatientId());
        validateDoctorExists(request.getAdmittingDoctorId());

        // Check if patient already has an active hospitalization
        List<Hospitalization> activeHospitalizations = hospitalizationRepository
                .findByPatientIdAndStatus(request.getPatientId(), HospitalizationStatus.ACTIVE);
        if (!activeHospitalizations.isEmpty()) {
            throw new RuntimeException("Patient already has an active hospitalization");
        }

        Hospitalization hospitalization = Hospitalization.builder()
                .patientId(request.getPatientId())
                .admittingDoctorId(request.getAdmittingDoctorId())
                .admissionReason(request.getAdmissionReason())
                .status(HospitalizationStatus.ACTIVE)
                .build();

        Hospitalization savedHospitalization = hospitalizationRepository.save(hospitalization);

        // If bed is provided, assign it
        if (request.getBedId() != null) {
            return assignBed(savedHospitalization.getId(), new BedAssignmentRequest(request.getBedId()));
        }

        return mapToResponse(savedHospitalization);
    }

    /**
     * Assign a bed to a hospitalization.
     * Requirements 7.2: Update bed status to occupied and link to hospitalization
     */
    @Transactional
    public HospitalizationResponse assignBed(Long hospitalizationId, BedAssignmentRequest request) {
        Hospitalization hospitalization = hospitalizationRepository.findById(hospitalizationId)
                .orElseThrow(() -> new RuntimeException("Hospitalization not found with id: " + hospitalizationId));

        if (hospitalization.getStatus() != HospitalizationStatus.ACTIVE) {
            throw new RuntimeException("Cannot assign bed to a non-active hospitalization");
        }

        Bed bed = bedService.getBedEntity(request.getBedId());

        if (bed.getStatus() != BedStatus.AVAILABLE && bed.getStatus() != BedStatus.RESERVED) {
            throw new RuntimeException("Bed is not available for assignment");
        }

        // Release previous bed if any
        if (hospitalization.getBedId() != null) {
            Bed previousBed = bedService.getBedEntity(hospitalization.getBedId());
            previousBed.setStatus(BedStatus.AVAILABLE);
            previousBed.setCurrentHospitalizationId(null);
            bedService.saveBed(previousBed);
        }

        // Assign new bed
        bed.setStatus(BedStatus.OCCUPIED);
        bed.setCurrentHospitalizationId(hospitalizationId);
        bedService.saveBed(bed);

        hospitalization.setBedId(request.getBedId());
        Hospitalization updatedHospitalization = hospitalizationRepository.save(hospitalization);

        return mapToResponse(updatedHospitalization);
    }

    /**
     * Transfer a patient to another bed.
     * Requirements 7.3: Record transfer with timestamp and new location
     */
    @Transactional
    public HospitalizationResponse transferPatient(Long hospitalizationId, BedTransferRequest request) {
        Hospitalization hospitalization = hospitalizationRepository.findById(hospitalizationId)
                .orElseThrow(() -> new RuntimeException("Hospitalization not found with id: " + hospitalizationId));

        if (hospitalization.getStatus() != HospitalizationStatus.ACTIVE) {
            throw new RuntimeException("Cannot transfer a non-active hospitalization");
        }

        if (hospitalization.getBedId() == null) {
            throw new RuntimeException("Patient does not have a bed assigned to transfer from");
        }

        Long fromBedId = hospitalization.getBedId();
        Bed fromBed = bedService.getBedEntity(fromBedId);
        Bed toBed = bedService.getBedEntity(request.getToBedId());

        if (toBed.getStatus() != BedStatus.AVAILABLE && toBed.getStatus() != BedStatus.RESERVED) {
            throw new RuntimeException("Target bed is not available for transfer");
        }

        // Create transfer record
        BedTransfer transfer = BedTransfer.builder()
                .hospitalizationId(hospitalizationId)
                .fromBedId(fromBedId)
                .toBedId(request.getToBedId())
                .reason(request.getReason())
                .build();
        bedTransferRepository.save(transfer);

        // Release old bed
        fromBed.setStatus(BedStatus.AVAILABLE);
        fromBed.setCurrentHospitalizationId(null);
        bedService.saveBed(fromBed);

        // Assign new bed
        toBed.setStatus(BedStatus.OCCUPIED);
        toBed.setCurrentHospitalizationId(hospitalizationId);
        bedService.saveBed(toBed);

        // Update hospitalization
        hospitalization.setBedId(request.getToBedId());
        Hospitalization updatedHospitalization = hospitalizationRepository.save(hospitalization);

        return mapToResponse(updatedHospitalization);
    }

    /**
     * Discharge a patient.
     * Requirements 7.4: Record discharge date, discharge type, and release the assigned bed
     */
    @Transactional
    public HospitalizationResponse dischargePatient(Long hospitalizationId, DischargeRequest request) {
        Hospitalization hospitalization = hospitalizationRepository.findById(hospitalizationId)
                .orElseThrow(() -> new RuntimeException("Hospitalization not found with id: " + hospitalizationId));

        if (hospitalization.getStatus() != HospitalizationStatus.ACTIVE) {
            throw new RuntimeException("Cannot discharge a non-active hospitalization");
        }

        // Release bed if assigned
        if (hospitalization.getBedId() != null) {
            Bed bed = bedService.getBedEntity(hospitalization.getBedId());
            bed.setStatus(BedStatus.AVAILABLE);
            bed.setCurrentHospitalizationId(null);
            bedService.saveBed(bed);
        }

        // Update hospitalization
        hospitalization.setDischargeDate(LocalDateTime.now());
        hospitalization.setDischargeType(request.getDischargeType());
        hospitalization.setStatus(HospitalizationStatus.DISCHARGED);

        Hospitalization updatedHospitalization = hospitalizationRepository.save(hospitalization);

        return mapToResponse(updatedHospitalization);
    }

    @Transactional(readOnly = true)
    public HospitalizationResponse getHospitalizationById(Long id) {
        Hospitalization hospitalization = hospitalizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospitalization not found with id: " + id));
        return mapToResponse(hospitalization);
    }

    /**
     * Get patient's hospitalization history.
     * Requirements 7.6: Display all past and current admissions
     */
    @Transactional(readOnly = true)
    public List<HospitalizationResponse> getPatientHospitalizations(Long patientId) {
        validatePatientExists(patientId);
        return hospitalizationRepository.findByPatientIdOrderByAdmissionDateDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HospitalizationResponse> getActiveHospitalizations() {
        return hospitalizationRepository.findByStatus(HospitalizationStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BedTransferResponse> getTransferHistory(Long hospitalizationId) {
        return bedTransferRepository.findByHospitalizationIdOrderByTransferredAtDesc(hospitalizationId)
                .stream()
                .map(this::mapTransferToResponse)
                .collect(Collectors.toList());
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

    private HospitalizationResponse mapToResponse(Hospitalization hospitalization) {
        HospitalizationResponse response = HospitalizationResponse.builder()
                .id(hospitalization.getId())
                .patientId(hospitalization.getPatientId())
                .admittingDoctorId(hospitalization.getAdmittingDoctorId())
                .bedId(hospitalization.getBedId())
                .admissionDate(hospitalization.getAdmissionDate())
                .dischargeDate(hospitalization.getDischargeDate())
                .admissionReason(hospitalization.getAdmissionReason())
                .dischargeType(hospitalization.getDischargeType())
                .status(hospitalization.getStatus())
                .build();

        if (hospitalization.getBedId() != null) {
            try {
                Bed bed = bedService.getBedEntity(hospitalization.getBedId());
                response.setBed(bedService.mapToResponse(bed));
            } catch (Exception e) {
                // Bed may have been deleted, ignore
            }
        }

        return response;
    }

    private BedTransferResponse mapTransferToResponse(BedTransfer transfer) {
        BedTransferResponse response = BedTransferResponse.builder()
                .id(transfer.getId())
                .hospitalizationId(transfer.getHospitalizationId())
                .fromBedId(transfer.getFromBedId())
                .toBedId(transfer.getToBedId())
                .transferredAt(transfer.getTransferredAt())
                .reason(transfer.getReason())
                .build();

        try {
            Bed fromBed = bedService.getBedEntity(transfer.getFromBedId());
            response.setFromBed(bedService.mapToResponse(fromBed));
        } catch (Exception e) {
            // Bed may have been deleted
        }

        try {
            Bed toBed = bedService.getBedEntity(transfer.getToBedId());
            response.setToBed(bedService.mapToResponse(toBed));
        } catch (Exception e) {
            // Bed may have been deleted
        }

        return response;
    }
}
