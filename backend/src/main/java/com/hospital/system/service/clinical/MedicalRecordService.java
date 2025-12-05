package com.hospital.system.service.clinical;

import com.hospital.system.dto.clinical.MedicalRecordRequest;
import com.hospital.system.dto.clinical.MedicalRecordResponse;
import com.hospital.system.model.core.Doctor;
import com.hospital.system.model.clinical.MedicalRecord;
import com.hospital.system.model.core.Patient;
import com.hospital.system.repository.core.DoctorRepository;
import com.hospital.system.repository.clinical.MedicalRecordRepository;
import com.hospital.system.repository.core.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        MedicalRecord medicalRecord = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .diagnosis(request.getDiagnosis())
                .treatment(request.getTreatment())
                .prescription(request.getPrescription())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(medicalRecord);
        return mapToResponse(savedRecord);
    }

    public List<MedicalRecordResponse> getMedicalRecordsByPatient(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordResponse> getMedicalRecordsByDoctor(Long doctorId) {
        return medicalRecordRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordResponse> getAllMedicalRecords() {
        return medicalRecordRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MedicalRecordResponse getMedicalRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));
        return mapToResponse(record);
    }

    public MedicalRecordResponse updateMedicalRecord(Long id, MedicalRecordRequest request) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));

        if (request.getDiagnosis() != null) {
            record.setDiagnosis(request.getDiagnosis());
        }
        if (request.getTreatment() != null) {
            record.setTreatment(request.getTreatment());
        }
        if (request.getPrescription() != null) {
            record.setPrescription(request.getPrescription());
        }

        MedicalRecord updatedRecord = medicalRecordRepository.save(record);
        return mapToResponse(updatedRecord);
    }

    public void deleteMedicalRecord(Long id) {
        if (!medicalRecordRepository.existsById(id)) {
            throw new RuntimeException("Medical record not found");
        }
        medicalRecordRepository.deleteById(id);
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getFirstName() + " " + record.getPatient().getLastName())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getUser().getFirstName() + " " + record.getDoctor().getUser().getLastName())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .prescription(record.getPrescription())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
