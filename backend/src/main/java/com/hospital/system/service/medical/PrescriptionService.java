package com.hospital.system.service.medical;

import com.hospital.system.dto.medical.*;
import com.hospital.system.model.core.Patient;
import com.hospital.system.model.core.Doctor;
import com.hospital.system.model.medical.Prescription;
import com.hospital.system.model.medical.PrescriptionItem;
import com.hospital.system.model.medical.PrescriptionStatus;
import com.hospital.system.repository.appointment.*;
import com.hospital.system.repository.medical.*;
import com.hospital.system.repository.core.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request) {
        validatePatientExists(request.getPatientId());
        validateDoctorExists(request.getDoctorId());
        
        if (request.getAppointmentId() != null) {
            validateAppointmentExists(request.getAppointmentId());
        }

        Prescription prescription = Prescription.builder()
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .appointmentId(request.getAppointmentId())
                .notes(request.getNotes())
                .status(PrescriptionStatus.ACTIVE)
                .build();

        // Add prescription items
        List<PrescriptionItem> items = request.getItems().stream()
                .map(itemRequest -> PrescriptionItem.builder()
                        .prescription(prescription)
                        .medicationName(itemRequest.getMedicationName())
                        .dose(itemRequest.getDose())
                        .frequency(itemRequest.getFrequency())
                        .duration(itemRequest.getDuration())
                        .instructions(itemRequest.getInstructions())
                        .build())
                .collect(Collectors.toList());
        
        prescription.setItems(items);

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        return mapToResponse(savedPrescription);
    }


    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));
        return mapToResponse(prescription);
    }

    @Transactional
    public PrescriptionResponse updatePrescriptionStatus(Long id, PrescriptionStatusUpdateRequest request) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));
        
        prescription.setStatus(request.getStatus());
        Prescription updatedPrescription = prescriptionRepository.save(prescription);
        return mapToResponse(updatedPrescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByPatient(Long patientId) {
        validatePatientExists(patientId);
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByPatientAndStatus(Long patientId, PrescriptionStatus status) {
        validatePatientExists(patientId);
        return prescriptionRepository.findByPatientIdAndStatusOrderByCreatedAtDesc(patientId, status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PrescriptionPrintResponse getPrescriptionForPrint(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + id));

        Patient patient = patientRepository.findById(prescription.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(prescription.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        String doctorName = doctor.getUser() != null ? doctor.getUser().getUsername() : "Unknown";

        List<PrescriptionItemResponse> medications = prescription.getItems().stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());

        return PrescriptionPrintResponse.builder()
                .prescriptionId(prescription.getId())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .patientDateOfBirth(patient.getDateOfBirth() != null 
                        ? patient.getDateOfBirth().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) 
                        : "N/A")
                .patientGender(patient.getGender())
                .doctorName(doctorName)
                .doctorSpecialty(doctor.getSpecialization())
                .prescriptionDate(prescription.getCreatedAt())
                .notes(prescription.getNotes())
                .medications(medications)
                .hospitalName("Hospital System")
                .hospitalAddress("Address configured in system")
                .build();
    }


    private PrescriptionResponse mapToResponse(Prescription prescription) {
        String patientName = patientRepository.findById(prescription.getPatientId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse("Unknown");

        String doctorName = doctorRepository.findById(prescription.getDoctorId())
                .map(d -> d.getUser() != null ? d.getUser().getUsername() : "Unknown")
                .orElse("Unknown");

        List<PrescriptionItemResponse> items = prescription.getItems().stream()
                .map(this::mapToItemResponse)
                .collect(Collectors.toList());

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .patientId(prescription.getPatientId())
                .patientName(patientName)
                .doctorId(prescription.getDoctorId())
                .doctorName(doctorName)
                .appointmentId(prescription.getAppointmentId())
                .status(prescription.getStatus())
                .notes(prescription.getNotes())
                .createdAt(prescription.getCreatedAt())
                .items(items)
                .build();
    }

    private PrescriptionItemResponse mapToItemResponse(PrescriptionItem item) {
        return PrescriptionItemResponse.builder()
                .id(item.getId())
                .medicationName(item.getMedicationName())
                .dose(item.getDose())
                .frequency(item.getFrequency())
                .duration(item.getDuration())
                .instructions(item.getInstructions())
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
