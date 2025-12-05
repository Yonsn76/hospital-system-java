package com.hospital.system.service.clinical;

import com.hospital.system.dto.clinical.VitalSignsRequest;
import com.hospital.system.dto.clinical.VitalSignsResponse;
import com.hospital.system.model.clinical.VitalSigns;
import com.hospital.system.repository.core.PatientRepository;
import com.hospital.system.repository.auth.UserRepository;
import com.hospital.system.repository.clinical.VitalSignsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VitalSignsService {

    private final VitalSignsRepository vitalSignsRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Transactional
    public VitalSignsResponse recordVitalSigns(VitalSignsRequest request) {
        validatePatientExists(request.getPatientId());
        validateNurseExists(request.getNurseId());

        VitalSigns vitalSigns = VitalSigns.builder()
                .patientId(request.getPatientId())
                .nurseId(request.getNurseId())
                .bloodPressureSystolic(request.getBloodPressureSystolic())
                .bloodPressureDiastolic(request.getBloodPressureDiastolic())
                .temperature(request.getTemperature())
                .heartRate(request.getHeartRate())
                .respiratoryRate(request.getRespiratoryRate())
                .oxygenSaturation(request.getOxygenSaturation())
                .weight(request.getWeight())
                .build();

        VitalSigns savedVitalSigns = vitalSignsRepository.save(vitalSigns);
        return mapToResponse(savedVitalSigns);
    }

    @Transactional(readOnly = true)
    public List<VitalSignsResponse> getVitalSignsByPatient(Long patientId) {
        validatePatientExists(patientId);
        return vitalSignsRepository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public VitalSignsResponse getLatestVitalSigns(Long patientId) {
        validatePatientExists(patientId);
        VitalSigns vitalSigns = vitalSignsRepository.findLatestByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("No vital signs found for patient: " + patientId));
        return mapToResponse(vitalSigns);
    }

    @Transactional(readOnly = true)
    public VitalSignsResponse getVitalSignsById(Long id) {
        VitalSigns vitalSigns = vitalSignsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vital signs not found with id: " + id));
        return mapToResponse(vitalSigns);
    }

    private VitalSignsResponse mapToResponse(VitalSigns vitalSigns) {
        String patientName = patientRepository.findById(vitalSigns.getPatientId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse("Unknown");

        String nurseName = userRepository.findById(vitalSigns.getNurseId())
                .map(u -> u.getFirstName() != null && u.getLastName() != null 
                        ? u.getFirstName() + " " + u.getLastName() 
                        : u.getUsername())
                .orElse("Unknown");

        return VitalSignsResponse.builder()
                .id(vitalSigns.getId())
                .patientId(vitalSigns.getPatientId())
                .patientName(patientName)
                .nurseId(vitalSigns.getNurseId())
                .nurseName(nurseName)
                .bloodPressureSystolic(vitalSigns.getBloodPressureSystolic())
                .bloodPressureDiastolic(vitalSigns.getBloodPressureDiastolic())
                .temperature(vitalSigns.getTemperature())
                .heartRate(vitalSigns.getHeartRate())
                .respiratoryRate(vitalSigns.getRespiratoryRate())
                .oxygenSaturation(vitalSigns.getOxygenSaturation())
                .weight(vitalSigns.getWeight())
                .recordedAt(vitalSigns.getRecordedAt())
                .build();
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
}
