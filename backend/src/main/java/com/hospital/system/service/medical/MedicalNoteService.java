package com.hospital.system.service.medical;

import com.hospital.system.dto.medical.*;
import com.hospital.system.model.medical.MedicalNote;
import com.hospital.system.model.medical.MedicalNoteVersion;
import com.hospital.system.repository.auth.*;
import com.hospital.system.repository.appointment.*;
import com.hospital.system.repository.medical.*;
import com.hospital.system.repository.core.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalNoteService {

    private final MedicalNoteRepository medicalNoteRepository;
    private final MedicalNoteVersionRepository medicalNoteVersionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public MedicalNoteResponse createMedicalNote(MedicalNoteRequest request) {
        validatePatientExists(request.getPatientId());
        validateDoctorExists(request.getDoctorId());
        
        if (request.getAppointmentId() != null) {
            validateAppointmentExists(request.getAppointmentId());
        }

        MedicalNote medicalNote = MedicalNote.builder()
                .patientId(request.getPatientId())
                .appointmentId(request.getAppointmentId())
                .doctorId(request.getDoctorId())
                .diagnosis(request.getDiagnosis())
                .treatmentPlan(request.getTreatmentPlan())
                .followUpDate(request.getFollowUpDate())
                .followUpInstructions(request.getFollowUpInstructions())
                .version(1)
                .build();

        MedicalNote savedNote = medicalNoteRepository.save(medicalNote);
        return mapToResponse(savedNote, false);
    }

    @Transactional(readOnly = true)
    public MedicalNoteResponse getMedicalNoteById(Long id) {
        MedicalNote medicalNote = medicalNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical note not found with id: " + id));
        return mapToResponse(medicalNote, true);
    }

    @Transactional
    public MedicalNoteResponse updateMedicalNote(Long id, MedicalNoteUpdateRequest request) {
        MedicalNote medicalNote = medicalNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical note not found with id: " + id));

        // Create version history entry before updating
        MedicalNoteVersion versionEntry = MedicalNoteVersion.builder()
                .medicalNote(medicalNote)
                .versionNumber(medicalNote.getVersion())
                .diagnosis(medicalNote.getDiagnosis())
                .treatmentPlan(medicalNote.getTreatmentPlan())
                .modifiedBy(request.getModifiedBy())
                .build();
        medicalNoteVersionRepository.save(versionEntry);

        // Update the medical note
        medicalNote.setDiagnosis(request.getDiagnosis());
        medicalNote.setTreatmentPlan(request.getTreatmentPlan());
        medicalNote.setFollowUpDate(request.getFollowUpDate());
        medicalNote.setFollowUpInstructions(request.getFollowUpInstructions());
        medicalNote.setVersion(medicalNote.getVersion() + 1);

        MedicalNote updatedNote = medicalNoteRepository.save(medicalNote);
        return mapToResponse(updatedNote, true);
    }

    @Transactional(readOnly = true)
    public List<MedicalNoteResponse> getMedicalNotesByPatient(Long patientId) {
        validatePatientExists(patientId);
        return medicalNoteRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(note -> mapToResponse(note, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicalNoteResponse getMedicalNoteByAppointment(Long appointmentId) {
        validateAppointmentExists(appointmentId);
        MedicalNote medicalNote = medicalNoteRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Medical note not found for appointment: " + appointmentId));
        return mapToResponse(medicalNote, true);
    }

    @Transactional(readOnly = true)
    public List<MedicalNoteVersionResponse> getVersionHistory(Long medicalNoteId) {
        if (!medicalNoteRepository.existsById(medicalNoteId)) {
            throw new RuntimeException("Medical note not found with id: " + medicalNoteId);
        }
        return medicalNoteVersionRepository.findByMedicalNoteIdOrderByVersionNumberDesc(medicalNoteId)
                .stream()
                .map(this::mapToVersionResponse)
                .collect(Collectors.toList());
    }

    private MedicalNoteResponse mapToResponse(MedicalNote note, boolean includeVersions) {
        String patientName = patientRepository.findById(note.getPatientId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse("Unknown");

        String doctorName = doctorRepository.findById(note.getDoctorId())
                .map(d -> d.getUser() != null ? d.getUser().getUsername() : "Unknown")
                .orElse("Unknown");

        List<MedicalNoteVersionResponse> versionHistory = null;
        if (includeVersions) {
            versionHistory = medicalNoteVersionRepository
                    .findByMedicalNoteIdOrderByVersionNumberDesc(note.getId())
                    .stream()
                    .map(this::mapToVersionResponse)
                    .collect(Collectors.toList());
        }

        return MedicalNoteResponse.builder()
                .id(note.getId())
                .patientId(note.getPatientId())
                .patientName(patientName)
                .appointmentId(note.getAppointmentId())
                .doctorId(note.getDoctorId())
                .doctorName(doctorName)
                .diagnosis(note.getDiagnosis())
                .treatmentPlan(note.getTreatmentPlan())
                .followUpDate(note.getFollowUpDate())
                .followUpInstructions(note.getFollowUpInstructions())
                .version(note.getVersion())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .versionHistory(versionHistory)
                .build();
    }

    private MedicalNoteVersionResponse mapToVersionResponse(MedicalNoteVersion version) {
        String modifiedByName = userRepository.findById(version.getModifiedBy())
                .map(u -> u.getUsername())
                .orElse("Unknown");

        return MedicalNoteVersionResponse.builder()
                .id(version.getId())
                .medicalNoteId(version.getMedicalNote().getId())
                .versionNumber(version.getVersionNumber())
                .diagnosis(version.getDiagnosis())
                .treatmentPlan(version.getTreatmentPlan())
                .modifiedBy(version.getModifiedBy())
                .modifiedByName(modifiedByName)
                .modifiedAt(version.getModifiedAt())
                .build();
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
}
