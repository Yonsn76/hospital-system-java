package com.hospital.system.controller;

import com.hospital.system.dto.*;
import com.hospital.system.service.ReportExportService;
import com.hospital.system.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for report generation and export.
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ReportExportService reportExportService;

    /**
     * Generate productivity report per doctor.
     * Requirements 10.1: Generate statistics per doctor including consultations, procedures, and patient volume
     */
    @GetMapping("/productivity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductivityReportDTO> getProductivityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long doctorId) {
        ProductivityReportDTO report = reportService.generateProductivityReport(startDate, endDate, doctorId);
        return ResponseEntity.ok(report);
    }

    /**
     * Generate attendance report with filters.
     * Requirements 10.2: Display patient visits filtered by date range, doctor, and specialty
     */
    @GetMapping("/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttendanceReportDTO> getAttendanceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String specialty) {
        AttendanceReportDTO report = reportService.generateAttendanceReport(startDate, endDate, doctorId, specialty);
        return ResponseEntity.ok(report);
    }

    /**
     * Generate frequent patients report.
     * Requirements 10.3: List patients with visit frequency above a configurable threshold
     */
    @GetMapping("/frequent-patients")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FrequentPatientsDTO> getFrequentPatientsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "3") int visitThreshold) {
        FrequentPatientsDTO report = reportService.generateFrequentPatientsReport(startDate, endDate, visitThreshold);
        return ResponseEntity.ok(report);
    }

    /**
     * Generate clinical statistics.
     * Requirements 10.4: Provide aggregated data on diagnoses, treatments, and outcomes
     */
    @GetMapping("/clinical-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClinicalStatisticsDTO> getClinicalStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ClinicalStatisticsDTO report = reportService.generateClinicalStatistics(startDate, endDate);
        return ResponseEntity.ok(report);
    }


    // ==================== Export Endpoints ====================

    /**
     * Export productivity report to PDF.
     * Requirements 10.5: Allow export to PDF format
     */
    @GetMapping("/productivity/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportProductivityReportToPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long doctorId) {
        ProductivityReportDTO report = reportService.generateProductivityReport(startDate, endDate, doctorId);
        byte[] pdfBytes = reportExportService.exportProductivityReportToPdf(report);
        return createPdfResponse(pdfBytes, "productivity_report.pdf");
    }

    /**
     * Export productivity report to Excel.
     * Requirements 10.5: Allow export to Excel format
     */
    @GetMapping("/productivity/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportProductivityReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long doctorId) {
        ProductivityReportDTO report = reportService.generateProductivityReport(startDate, endDate, doctorId);
        byte[] excelBytes = reportExportService.exportProductivityReportToExcel(report);
        return createExcelResponse(excelBytes, "productivity_report.xlsx");
    }

    /**
     * Export attendance report to PDF.
     * Requirements 10.5: Allow export to PDF format
     */
    @GetMapping("/attendance/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAttendanceReportToPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String specialty) {
        AttendanceReportDTO report = reportService.generateAttendanceReport(startDate, endDate, doctorId, specialty);
        byte[] pdfBytes = reportExportService.exportAttendanceReportToPdf(report);
        return createPdfResponse(pdfBytes, "attendance_report.pdf");
    }

    /**
     * Export attendance report to Excel.
     * Requirements 10.5: Allow export to Excel format
     */
    @GetMapping("/attendance/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAttendanceReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String specialty) {
        AttendanceReportDTO report = reportService.generateAttendanceReport(startDate, endDate, doctorId, specialty);
        byte[] excelBytes = reportExportService.exportAttendanceReportToExcel(report);
        return createExcelResponse(excelBytes, "attendance_report.xlsx");
    }

    /**
     * Export frequent patients report to PDF.
     * Requirements 10.5: Allow export to PDF format
     */
    @GetMapping("/frequent-patients/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportFrequentPatientsReportToPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "3") int visitThreshold) {
        FrequentPatientsDTO report = reportService.generateFrequentPatientsReport(startDate, endDate, visitThreshold);
        byte[] pdfBytes = reportExportService.exportFrequentPatientsReportToPdf(report);
        return createPdfResponse(pdfBytes, "frequent_patients_report.pdf");
    }

    /**
     * Export frequent patients report to Excel.
     * Requirements 10.5: Allow export to Excel format
     */
    @GetMapping("/frequent-patients/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportFrequentPatientsReportToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "3") int visitThreshold) {
        FrequentPatientsDTO report = reportService.generateFrequentPatientsReport(startDate, endDate, visitThreshold);
        byte[] excelBytes = reportExportService.exportFrequentPatientsReportToExcel(report);
        return createExcelResponse(excelBytes, "frequent_patients_report.xlsx");
    }

    /**
     * Export clinical statistics to PDF.
     * Requirements 10.5: Allow export to PDF format
     */
    @GetMapping("/clinical-statistics/export/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportClinicalStatisticsToPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ClinicalStatisticsDTO report = reportService.generateClinicalStatistics(startDate, endDate);
        byte[] pdfBytes = reportExportService.exportClinicalStatisticsToPdf(report);
        return createPdfResponse(pdfBytes, "clinical_statistics_report.pdf");
    }

    /**
     * Export clinical statistics to Excel.
     * Requirements 10.5: Allow export to Excel format
     */
    @GetMapping("/clinical-statistics/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportClinicalStatisticsToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ClinicalStatisticsDTO report = reportService.generateClinicalStatistics(startDate, endDate);
        byte[] excelBytes = reportExportService.exportClinicalStatisticsToExcel(report);
        return createExcelResponse(excelBytes, "clinical_statistics_report.xlsx");
    }

    // ==================== Helper Methods ====================

    private ResponseEntity<byte[]> createPdfResponse(byte[] content, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(content.length);
        return ResponseEntity.ok().headers(headers).body(content);
    }

    private ResponseEntity<byte[]> createExcelResponse(byte[] content, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(content.length);
        return ResponseEntity.ok().headers(headers).body(content);
    }
}
