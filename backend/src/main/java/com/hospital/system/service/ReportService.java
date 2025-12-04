package com.hospital.system.service;

import com.hospital.system.dto.*;
import com.hospital.system.model.*;
import com.hospital.system.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating advanced reports.
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final MedicalNoteRepository medicalNoteRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabExamRepository labExamRepository;
    private final HospitalizationRepository hospitalizationRepository;
    private final TriageRepository triageRepository;

    /**
     * Generate productivity report per doctor.
     * Requirements 10.1: Generate statistics per doctor including consultations, procedures, and patient volume
     */
    public ProductivityReportDTO generateProductivityReport(LocalDate startDate, LocalDate endDate, Long doctorId) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<Doctor> doctors;
        if (doctorId != null) {
            doctors = doctorRepository.findById(doctorId)
                    .map(Collections::singletonList)
                    .orElse(Collections.emptyList());
        } else {
            doctors = doctorRepository.findAll();
        }

        List<Appointment> allAppointments = appointmentRepository.findAll().stream()
                .filter(a -> isWithinDateRange(a.getAppointmentTime(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        List<Prescription> allPrescriptions = prescriptionRepository.findAll().stream()
                .filter(p -> isWithinDateRange(p.getCreatedAt(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        List<LabExam> allLabExams = labExamRepository.findAll().stream()
                .filter(e -> isWithinDateRange(e.getRequestedAt(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        List<ProductivityReportDTO.DoctorProductivityDTO> doctorProductivity = doctors.stream()
                .map(doctor -> {
                    List<Appointment> doctorAppointments = allAppointments.stream()
                            .filter(a -> a.getDoctor().getId().equals(doctor.getId()))
                            .collect(Collectors.toList());

                    Set<Long> uniquePatients = doctorAppointments.stream()
                            .map(a -> a.getPatient().getId())
                            .collect(Collectors.toSet());

                    long prescriptionCount = allPrescriptions.stream()
                            .filter(p -> p.getDoctorId().equals(doctor.getId()))
                            .count();

                    long labExamCount = allLabExams.stream()
                            .filter(e -> e.getRequestingDoctorId().equals(doctor.getId()))
                            .count();

                    String doctorName = doctor.getUser() != null
                            ? doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName()
                            : "Unknown";

                    return ProductivityReportDTO.DoctorProductivityDTO.builder()
                            .doctorId(doctor.getId())
                            .doctorName(doctorName)
                            .specialization(doctor.getSpecialization())
                            .consultationCount(doctorAppointments.size())
                            .uniquePatientCount(uniquePatients.size())
                            .prescriptionCount((int) prescriptionCount)
                            .labExamCount((int) labExamCount)
                            .build();
                })
                .collect(Collectors.toList());

        int totalConsultations = doctorProductivity.stream()
                .mapToInt(ProductivityReportDTO.DoctorProductivityDTO::getConsultationCount)
                .sum();

        Set<Long> allUniquePatients = allAppointments.stream()
                .map(a -> a.getPatient().getId())
                .collect(Collectors.toSet());

        return ProductivityReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .doctorProductivity(doctorProductivity)
                .totalConsultations(totalConsultations)
                .totalPatients(allUniquePatients.size())
                .build();
    }


    /**
     * Generate attendance report with filters.
     * Requirements 10.2: Display patient visits filtered by date range, doctor, and specialty
     */
    public AttendanceReportDTO generateAttendanceReport(LocalDate startDate, LocalDate endDate, Long doctorId, String specialty) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(a -> isWithinDateRange(a.getAppointmentTime(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        if (doctorId != null) {
            appointments = appointments.stream()
                    .filter(a -> a.getDoctor().getId().equals(doctorId))
                    .collect(Collectors.toList());
        }

        if (specialty != null && !specialty.isEmpty()) {
            appointments = appointments.stream()
                    .filter(a -> specialty.equalsIgnoreCase(a.getDoctor().getSpecialization()))
                    .collect(Collectors.toList());
        }

        List<AttendanceReportDTO.AttendanceRecordDTO> records = appointments.stream()
                .map(a -> AttendanceReportDTO.AttendanceRecordDTO.builder()
                        .appointmentId(a.getId())
                        .patientId(a.getPatient().getId())
                        .patientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName())
                        .appointmentTime(a.getAppointmentTime())
                        .status(a.getStatus())
                        .reason(a.getReason())
                        .build())
                .sorted(Comparator.comparing(AttendanceReportDTO.AttendanceRecordDTO::getAppointmentTime))
                .collect(Collectors.toList());

        int completedVisits = (int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        int cancelledVisits = (int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .count();

        int noShowVisits = (int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
                .count();

        String doctorName = null;
        String doctorSpecialty = specialty;
        if (doctorId != null) {
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor != null && doctor.getUser() != null) {
                doctorName = doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName();
                doctorSpecialty = doctor.getSpecialization();
            }
        }

        return AttendanceReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .doctorId(doctorId)
                .doctorName(doctorName)
                .specialty(doctorSpecialty)
                .attendanceRecords(records)
                .totalVisits(appointments.size())
                .completedVisits(completedVisits)
                .cancelledVisits(cancelledVisits)
                .noShowVisits(noShowVisits)
                .build();
    }

    /**
     * Generate frequent patients report.
     * Requirements 10.3: List patients with visit frequency above a configurable threshold
     */
    public FrequentPatientsDTO generateFrequentPatientsReport(LocalDate startDate, LocalDate endDate, int visitThreshold) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(a -> isWithinDateRange(a.getAppointmentTime(), startDateTime, endDateTime))
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        Map<Long, List<Appointment>> appointmentsByPatient = appointments.stream()
                .collect(Collectors.groupingBy(a -> a.getPatient().getId()));

        List<MedicalNote> allNotes = medicalNoteRepository.findAll().stream()
                .filter(n -> isWithinDateRange(n.getCreatedAt(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        Map<Long, List<MedicalNote>> notesByPatient = allNotes.stream()
                .collect(Collectors.groupingBy(MedicalNote::getPatientId));

        List<FrequentPatientsDTO.FrequentPatientDTO> frequentPatients = appointmentsByPatient.entrySet().stream()
                .filter(entry -> entry.getValue().size() >= visitThreshold)
                .map(entry -> {
                    Long patientId = entry.getKey();
                    List<Appointment> patientAppointments = entry.getValue();
                    Patient patient = patientAppointments.get(0).getPatient();

                    LocalDate lastVisit = patientAppointments.stream()
                            .map(a -> a.getAppointmentTime().toLocalDate())
                            .max(LocalDate::compareTo)
                            .orElse(null);

                    List<String> diagnoses = notesByPatient.getOrDefault(patientId, Collections.emptyList()).stream()
                            .map(MedicalNote::getDiagnosis)
                            .distinct()
                            .limit(5)
                            .collect(Collectors.toList());

                    return FrequentPatientsDTO.FrequentPatientDTO.builder()
                            .patientId(patientId)
                            .patientName(patient.getFirstName() + " " + patient.getLastName())
                            .contactNumber(patient.getContactNumber())
                            .visitCount(patientAppointments.size())
                            .lastVisitDate(lastVisit)
                            .primaryDiagnoses(diagnoses)
                            .build();
                })
                .sorted(Comparator.comparingInt(FrequentPatientsDTO.FrequentPatientDTO::getVisitCount).reversed())
                .collect(Collectors.toList());

        return FrequentPatientsDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .visitThreshold(visitThreshold)
                .frequentPatients(frequentPatients)
                .totalFrequentPatients(frequentPatients.size())
                .build();
    }


    /**
     * Generate clinical statistics aggregation.
     * Requirements 10.4: Provide aggregated data on diagnoses, treatments, and outcomes
     */
    public ClinicalStatisticsDTO generateClinicalStatistics(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Appointments statistics
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(a -> isWithinDateRange(a.getAppointmentTime(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        Map<String, Integer> appointmentsByStatus = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getStatus().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        Set<Long> uniquePatients = appointments.stream()
                .map(a -> a.getPatient().getId())
                .collect(Collectors.toSet());

        // Prescriptions statistics
        List<Prescription> prescriptions = prescriptionRepository.findAll().stream()
                .filter(p -> isWithinDateRange(p.getCreatedAt(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        Map<String, Integer> prescriptionsByStatus = prescriptions.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getStatus().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        // Lab exams statistics
        List<LabExam> labExams = labExamRepository.findAll().stream()
                .filter(e -> isWithinDateRange(e.getRequestedAt(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        Map<String, Integer> labExamsByStatus = labExams.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getStatus().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        // Hospitalizations statistics
        List<Hospitalization> hospitalizations = hospitalizationRepository.findAll().stream()
                .filter(h -> isWithinDateRange(h.getAdmissionDate(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        // Triage statistics
        List<Triage> triages = triageRepository.findAll().stream()
                .filter(t -> isWithinDateRange(t.getArrivedAt(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        Map<String, Integer> triagesByPriority = triages.stream()
                .filter(t -> t.getPriorityLevel() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getPriorityLevel().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        // Diagnosis statistics from medical notes
        List<MedicalNote> medicalNotes = medicalNoteRepository.findAll().stream()
                .filter(n -> isWithinDateRange(n.getCreatedAt(), startDateTime, endDateTime))
                .collect(Collectors.toList());

        Map<String, Long> diagnosisCounts = medicalNotes.stream()
                .map(MedicalNote::getDiagnosis)
                .filter(d -> d != null && !d.isEmpty())
                .collect(Collectors.groupingBy(d -> d, Collectors.counting()));

        int totalDiagnoses = diagnosisCounts.values().stream().mapToInt(Long::intValue).sum();

        List<ClinicalStatisticsDTO.DiagnosisStatDTO> topDiagnoses = diagnosisCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> ClinicalStatisticsDTO.DiagnosisStatDTO.builder()
                        .diagnosis(entry.getKey())
                        .count(entry.getValue().intValue())
                        .percentage(totalDiagnoses > 0 ? (entry.getValue() * 100.0 / totalDiagnoses) : 0)
                        .build())
                .collect(Collectors.toList());

        return ClinicalStatisticsDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalAppointments(appointments.size())
                .totalPatients(uniquePatients.size())
                .totalPrescriptions(prescriptions.size())
                .totalLabExams(labExams.size())
                .totalHospitalizations(hospitalizations.size())
                .totalTriages(triages.size())
                .topDiagnoses(topDiagnoses)
                .appointmentsByStatus(appointmentsByStatus)
                .prescriptionsByStatus(prescriptionsByStatus)
                .labExamsByStatus(labExamsByStatus)
                .triagesByPriority(triagesByPriority)
                .build();
    }

    private boolean isWithinDateRange(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
        return dateTime != null && !dateTime.isBefore(start) && dateTime.isBefore(end);
    }
}
