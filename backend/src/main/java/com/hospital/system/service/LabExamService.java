package com.hospital.system.service;

import com.hospital.system.dto.*;
import com.hospital.system.model.*;
import com.hospital.system.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabExamService {

    private final LabExamRepository labExamRepository;
    private final LabResultRepository labResultRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public LabExamResponse createLabExam(LabExamRequest request) {
        validatePatientExists(request.getPatientId());
        validateDoctorExists(request.getRequestingDoctorId());

        if (request.getAppointmentId() != null) {
            validateAppointmentExists(request.getAppointmentId());
        }

        LabExam labExam = LabExam.builder()
                .patientId(request.getPatientId())
                .requestingDoctorId(request.getRequestingDoctorId())
                .appointmentId(request.getAppointmentId())
                .examType(request.getExamType())
                .priority(request.getPriority() != null ? request.getPriority() : ExamPriority.ROUTINE)
                .clinicalIndication(request.getClinicalIndication())
                .status(ExamStatus.REQUESTED)
                .build();

        LabExam savedExam = labExamRepository.save(labExam);
        return mapToResponse(savedExam);
    }

    @Transactional(readOnly = true)
    public LabExamResponse getLabExamById(Long id) {
        LabExam labExam = labExamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab exam not found with id: " + id));
        return mapToResponse(labExam);
    }


    @Transactional
    public LabExamResponse uploadResults(Long examId, LabResultsUploadRequest request) {
        LabExam labExam = labExamRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Lab exam not found with id: " + examId));

        validateUserExists(request.getUploadedBy());

        List<LabResult> results = request.getResults().stream()
                .map(resultItem -> {
                    Boolean isAbnormal = resultItem.getIsAbnormal();
                    if (isAbnormal == null && resultItem.getReferenceRange() != null) {
                        isAbnormal = detectAbnormalValue(resultItem.getResultValue(), resultItem.getReferenceRange());
                    }

                    return LabResult.builder()
                            .labExam(labExam)
                            .parameterName(resultItem.getParameterName())
                            .resultValue(resultItem.getResultValue())
                            .referenceRange(resultItem.getReferenceRange())
                            .isAbnormal(isAbnormal != null ? isAbnormal : false)
                            .notes(resultItem.getNotes())
                            .uploadedBy(request.getUploadedBy())
                            .build();
                })
                .collect(Collectors.toList());

        labResultRepository.saveAll(results);
        labExam.getResults().addAll(results);
        labExam.setStatus(ExamStatus.COMPLETED);
        labExam.setCompletedAt(LocalDateTime.now());

        LabExam updatedExam = labExamRepository.save(labExam);
        return mapToResponse(updatedExam);
    }

    @Transactional
    public LabExamResponse updateStatus(Long examId, ExamStatus status) {
        LabExam labExam = labExamRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Lab exam not found with id: " + examId));

        labExam.setStatus(status);
        if (status == ExamStatus.COMPLETED && labExam.getCompletedAt() == null) {
            labExam.setCompletedAt(LocalDateTime.now());
        }

        LabExam updatedExam = labExamRepository.save(labExam);
        return mapToResponse(updatedExam);
    }

    @Transactional(readOnly = true)
    public List<LabExamResponse> getLabExamsByPatient(Long patientId) {
        validatePatientExists(patientId);
        return labExamRepository.findByPatientIdOrderByRequestedAtDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabExamResponse> getPendingResultsForDoctor(Long doctorId) {
        validateDoctorExists(doctorId);
        return labExamRepository.findByRequestingDoctorIdAndStatusOrderByRequestedAtDesc(doctorId, ExamStatus.REQUESTED)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabExamResponse> getLabExamsByAppointment(Long appointmentId) {
        return labExamRepository.findByAppointmentIdOrderByRequestedAtDesc(appointmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    /**
     * Detects if a result value is abnormal based on the reference range.
     * Reference range format expected: "min-max" (e.g., "70-100")
     */
    private Boolean detectAbnormalValue(String resultValue, String referenceRange) {
        if (resultValue == null || referenceRange == null || referenceRange.isBlank()) {
            return false;
        }

        try {
            double value = Double.parseDouble(resultValue.replaceAll("[^0-9.]", ""));
            String[] range = referenceRange.split("-");
            if (range.length == 2) {
                double min = Double.parseDouble(range[0].trim().replaceAll("[^0-9.]", ""));
                double max = Double.parseDouble(range[1].trim().replaceAll("[^0-9.]", ""));
                return value < min || value > max;
            }
        } catch (NumberFormatException e) {
            // If parsing fails, cannot determine abnormality
            return false;
        }
        return false;
    }

    private LabExamResponse mapToResponse(LabExam labExam) {
        String patientName = patientRepository.findById(labExam.getPatientId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse("Unknown");

        String doctorName = doctorRepository.findById(labExam.getRequestingDoctorId())
                .map(d -> d.getUser() != null ? d.getUser().getUsername() : "Unknown")
                .orElse("Unknown");

        List<LabResultResponse> results = labExam.getResults().stream()
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());

        return LabExamResponse.builder()
                .id(labExam.getId())
                .patientId(labExam.getPatientId())
                .patientName(patientName)
                .requestingDoctorId(labExam.getRequestingDoctorId())
                .requestingDoctorName(doctorName)
                .appointmentId(labExam.getAppointmentId())
                .examType(labExam.getExamType())
                .priority(labExam.getPriority())
                .clinicalIndication(labExam.getClinicalIndication())
                .status(labExam.getStatus())
                .requestedAt(labExam.getRequestedAt())
                .completedAt(labExam.getCompletedAt())
                .results(results)
                .build();
    }

    private LabResultResponse mapToResultResponse(LabResult result) {
        String uploadedByName = userRepository.findById(result.getUploadedBy())
                .map(User::getUsername)
                .orElse("Unknown");

        return LabResultResponse.builder()
                .id(result.getId())
                .labExamId(result.getLabExam().getId())
                .parameterName(result.getParameterName())
                .resultValue(result.getResultValue())
                .referenceRange(result.getReferenceRange())
                .isAbnormal(result.getIsAbnormal())
                .notes(result.getNotes())
                .uploadedBy(result.getUploadedBy())
                .uploadedByName(uploadedByName)
                .uploadedAt(result.getUploadedAt())
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

    private void validateUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }
}
