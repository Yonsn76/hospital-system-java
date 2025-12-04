package com.hospital.system.service;

import com.hospital.system.dto.*;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

/**
 * Service for exporting reports to PDF and Excel formats.
 * Requirements 10.5: Allow export to PDF and Excel formats
 */
@Service
@RequiredArgsConstructor
public class ReportExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // ==================== PDF Export Methods ====================

    /**
     * Export productivity report to PDF.
     */
    public byte[] exportProductivityReportToPdf(ProductivityReportDTO report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Productivity Report")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            // Date range
            document.add(new Paragraph(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)))
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Summary
            document.add(new Paragraph(String.format("Total Consultations: %d", report.getTotalConsultations())));
            document.add(new Paragraph(String.format("Total Patients: %d", report.getTotalPatients())));

            document.add(new Paragraph("\n"));

            // Doctor productivity table
            if (report.getDoctorProductivity() != null && !report.getDoctorProductivity().isEmpty()) {
                Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 1, 1, 1, 1}))
                        .useAllAvailableWidth();

                // Headers
                table.addHeaderCell(createHeaderCell("Doctor"));
                table.addHeaderCell(createHeaderCell("Specialization"));
                table.addHeaderCell(createHeaderCell("Consultations"));
                table.addHeaderCell(createHeaderCell("Patients"));
                table.addHeaderCell(createHeaderCell("Prescriptions"));
                table.addHeaderCell(createHeaderCell("Lab Exams"));

                for (ProductivityReportDTO.DoctorProductivityDTO dp : report.getDoctorProductivity()) {
                    table.addCell(dp.getDoctorName());
                    table.addCell(dp.getSpecialization() != null ? dp.getSpecialization() : "N/A");
                    table.addCell(String.valueOf(dp.getConsultationCount()));
                    table.addCell(String.valueOf(dp.getUniquePatientCount()));
                    table.addCell(String.valueOf(dp.getPrescriptionCount()));
                    table.addCell(String.valueOf(dp.getLabExamCount()));
                }

                document.add(table);
            }

            document.close();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }


    /**
     * Export attendance report to PDF.
     */
    public byte[] exportAttendanceReportToPdf(AttendanceReportDTO report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Attendance Report")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            // Date range and filters
            document.add(new Paragraph(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)))
                    .setTextAlignment(TextAlignment.CENTER));

            if (report.getDoctorName() != null) {
                document.add(new Paragraph(String.format("Doctor: %s", report.getDoctorName()))
                        .setTextAlignment(TextAlignment.CENTER));
            }
            if (report.getSpecialty() != null) {
                document.add(new Paragraph(String.format("Specialty: %s", report.getSpecialty()))
                        .setTextAlignment(TextAlignment.CENTER));
            }

            document.add(new Paragraph("\n"));

            // Summary
            document.add(new Paragraph(String.format("Total Visits: %d", report.getTotalVisits())));
            document.add(new Paragraph(String.format("Completed: %d", report.getCompletedVisits())));
            document.add(new Paragraph(String.format("Cancelled: %d", report.getCancelledVisits())));
            document.add(new Paragraph(String.format("No Show: %d", report.getNoShowVisits())));

            document.add(new Paragraph("\n"));

            // Attendance records table
            if (report.getAttendanceRecords() != null && !report.getAttendanceRecords().isEmpty()) {
                Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 3}))
                        .useAllAvailableWidth();

                table.addHeaderCell(createHeaderCell("Date/Time"));
                table.addHeaderCell(createHeaderCell("Patient"));
                table.addHeaderCell(createHeaderCell("Status"));
                table.addHeaderCell(createHeaderCell("Reason"));

                for (AttendanceReportDTO.AttendanceRecordDTO record : report.getAttendanceRecords()) {
                    table.addCell(record.getAppointmentTime().format(DATETIME_FORMATTER));
                    table.addCell(record.getPatientName());
                    table.addCell(record.getStatus().name());
                    table.addCell(record.getReason() != null ? record.getReason() : "N/A");
                }

                document.add(table);
            }

            document.close();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    /**
     * Export frequent patients report to PDF.
     */
    public byte[] exportFrequentPatientsReportToPdf(FrequentPatientsDTO report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Frequent Patients Report")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            // Date range
            document.add(new Paragraph(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)))
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph(String.format("Visit Threshold: %d+", report.getVisitThreshold()))
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Summary
            document.add(new Paragraph(String.format("Total Frequent Patients: %d", report.getTotalFrequentPatients())));

            document.add(new Paragraph("\n"));

            // Frequent patients table
            if (report.getFrequentPatients() != null && !report.getFrequentPatients().isEmpty()) {
                Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 1, 2, 4}))
                        .useAllAvailableWidth();

                table.addHeaderCell(createHeaderCell("Patient"));
                table.addHeaderCell(createHeaderCell("Contact"));
                table.addHeaderCell(createHeaderCell("Visits"));
                table.addHeaderCell(createHeaderCell("Last Visit"));
                table.addHeaderCell(createHeaderCell("Primary Diagnoses"));

                for (FrequentPatientsDTO.FrequentPatientDTO patient : report.getFrequentPatients()) {
                    table.addCell(patient.getPatientName());
                    table.addCell(patient.getContactNumber() != null ? patient.getContactNumber() : "N/A");
                    table.addCell(String.valueOf(patient.getVisitCount()));
                    table.addCell(patient.getLastVisitDate() != null ? patient.getLastVisitDate().format(DATE_FORMATTER) : "N/A");
                    table.addCell(patient.getPrimaryDiagnoses() != null ? String.join(", ", patient.getPrimaryDiagnoses()) : "N/A");
                }

                document.add(table);
            }

            document.close();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }


    /**
     * Export clinical statistics to PDF.
     */
    public byte[] exportClinicalStatisticsToPdf(ClinicalStatisticsDTO report) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Clinical Statistics Report")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            // Date range
            document.add(new Paragraph(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)))
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Summary statistics
            document.add(new Paragraph("Summary Statistics").setBold().setFontSize(14));
            document.add(new Paragraph(String.format("Total Appointments: %d", report.getTotalAppointments())));
            document.add(new Paragraph(String.format("Total Patients: %d", report.getTotalPatients())));
            document.add(new Paragraph(String.format("Total Prescriptions: %d", report.getTotalPrescriptions())));
            document.add(new Paragraph(String.format("Total Lab Exams: %d", report.getTotalLabExams())));
            document.add(new Paragraph(String.format("Total Hospitalizations: %d", report.getTotalHospitalizations())));
            document.add(new Paragraph(String.format("Total Triages: %d", report.getTotalTriages())));

            document.add(new Paragraph("\n"));

            // Top diagnoses table
            if (report.getTopDiagnoses() != null && !report.getTopDiagnoses().isEmpty()) {
                document.add(new Paragraph("Top Diagnoses").setBold().setFontSize(14));
                Table table = new Table(UnitValue.createPercentArray(new float[]{5, 1, 1}))
                        .useAllAvailableWidth();

                table.addHeaderCell(createHeaderCell("Diagnosis"));
                table.addHeaderCell(createHeaderCell("Count"));
                table.addHeaderCell(createHeaderCell("Percentage"));

                for (ClinicalStatisticsDTO.DiagnosisStatDTO diagnosis : report.getTopDiagnoses()) {
                    table.addCell(diagnosis.getDiagnosis());
                    table.addCell(String.valueOf(diagnosis.getCount()));
                    table.addCell(String.format("%.1f%%", diagnosis.getPercentage()));
                }

                document.add(table);
            }

            document.close();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private Cell createHeaderCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold())
                .setTextAlignment(TextAlignment.CENTER);
    }

    // ==================== Excel Export Methods ====================

    /**
     * Export productivity report to Excel.
     */
    public byte[] exportProductivityReportToExcel(ProductivityReportDTO report) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Productivity Report");
            CellStyle headerStyle = createHeaderStyle(workbook);
            int rowNum = 0;

            // Title
            Row titleRow = sheet.createRow(rowNum++);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Productivity Report");
            titleCell.setCellStyle(headerStyle);

            // Date range
            Row dateRow = sheet.createRow(rowNum++);
            dateRow.createCell(0).setCellValue(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)));

            rowNum++; // Empty row

            // Summary
            Row summaryRow1 = sheet.createRow(rowNum++);
            summaryRow1.createCell(0).setCellValue("Total Consultations:");
            summaryRow1.createCell(1).setCellValue(report.getTotalConsultations());

            Row summaryRow2 = sheet.createRow(rowNum++);
            summaryRow2.createCell(0).setCellValue("Total Patients:");
            summaryRow2.createCell(1).setCellValue(report.getTotalPatients());

            rowNum++; // Empty row

            // Headers
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Doctor", "Specialization", "Consultations", "Patients", "Prescriptions", "Lab Exams"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            if (report.getDoctorProductivity() != null) {
                for (ProductivityReportDTO.DoctorProductivityDTO dp : report.getDoctorProductivity()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(dp.getDoctorName());
                    row.createCell(1).setCellValue(dp.getSpecialization() != null ? dp.getSpecialization() : "N/A");
                    row.createCell(2).setCellValue(dp.getConsultationCount());
                    row.createCell(3).setCellValue(dp.getUniquePatientCount());
                    row.createCell(4).setCellValue(dp.getPrescriptionCount());
                    row.createCell(5).setCellValue(dp.getLabExamCount());
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }


    /**
     * Export attendance report to Excel.
     */
    public byte[] exportAttendanceReportToExcel(AttendanceReportDTO report) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Attendance Report");
            CellStyle headerStyle = createHeaderStyle(workbook);
            int rowNum = 0;

            // Title
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Attendance Report");

            // Date range
            Row dateRow = sheet.createRow(rowNum++);
            dateRow.createCell(0).setCellValue(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)));

            if (report.getDoctorName() != null) {
                Row doctorRow = sheet.createRow(rowNum++);
                doctorRow.createCell(0).setCellValue("Doctor: " + report.getDoctorName());
            }

            rowNum++; // Empty row

            // Summary
            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Visits: " + report.getTotalVisits());
            sheet.createRow(rowNum++).createCell(0).setCellValue("Completed: " + report.getCompletedVisits());
            sheet.createRow(rowNum++).createCell(0).setCellValue("Cancelled: " + report.getCancelledVisits());
            sheet.createRow(rowNum++).createCell(0).setCellValue("No Show: " + report.getNoShowVisits());

            rowNum++; // Empty row

            // Headers
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Date/Time", "Patient", "Status", "Reason"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            if (report.getAttendanceRecords() != null) {
                for (AttendanceReportDTO.AttendanceRecordDTO record : report.getAttendanceRecords()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(record.getAppointmentTime().format(DATETIME_FORMATTER));
                    row.createCell(1).setCellValue(record.getPatientName());
                    row.createCell(2).setCellValue(record.getStatus().name());
                    row.createCell(3).setCellValue(record.getReason() != null ? record.getReason() : "N/A");
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    /**
     * Export frequent patients report to Excel.
     */
    public byte[] exportFrequentPatientsReportToExcel(FrequentPatientsDTO report) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Frequent Patients");
            CellStyle headerStyle = createHeaderStyle(workbook);
            int rowNum = 0;

            // Title
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Frequent Patients Report");

            // Date range
            Row dateRow = sheet.createRow(rowNum++);
            dateRow.createCell(0).setCellValue(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)));

            Row thresholdRow = sheet.createRow(rowNum++);
            thresholdRow.createCell(0).setCellValue("Visit Threshold: " + report.getVisitThreshold() + "+");

            rowNum++; // Empty row

            // Summary
            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Frequent Patients: " + report.getTotalFrequentPatients());

            rowNum++; // Empty row

            // Headers
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Patient", "Contact", "Visits", "Last Visit", "Primary Diagnoses"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            if (report.getFrequentPatients() != null) {
                for (FrequentPatientsDTO.FrequentPatientDTO patient : report.getFrequentPatients()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(patient.getPatientName());
                    row.createCell(1).setCellValue(patient.getContactNumber() != null ? patient.getContactNumber() : "N/A");
                    row.createCell(2).setCellValue(patient.getVisitCount());
                    row.createCell(3).setCellValue(patient.getLastVisitDate() != null ? patient.getLastVisitDate().format(DATE_FORMATTER) : "N/A");
                    row.createCell(4).setCellValue(patient.getPrimaryDiagnoses() != null ? String.join(", ", patient.getPrimaryDiagnoses()) : "N/A");
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }


    /**
     * Export clinical statistics to Excel.
     */
    public byte[] exportClinicalStatisticsToExcel(ClinicalStatisticsDTO report) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Clinical Statistics");
            CellStyle headerStyle = createHeaderStyle(workbook);
            int rowNum = 0;

            // Title
            Row titleRow = sheet.createRow(rowNum++);
            titleRow.createCell(0).setCellValue("Clinical Statistics Report");

            // Date range
            Row dateRow = sheet.createRow(rowNum++);
            dateRow.createCell(0).setCellValue(String.format("Period: %s to %s",
                    report.getStartDate().format(DATE_FORMATTER),
                    report.getEndDate().format(DATE_FORMATTER)));

            rowNum++; // Empty row

            // Summary statistics
            Row summaryHeader = sheet.createRow(rowNum++);
            summaryHeader.createCell(0).setCellValue("Summary Statistics");

            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Appointments: " + report.getTotalAppointments());
            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Patients: " + report.getTotalPatients());
            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Prescriptions: " + report.getTotalPrescriptions());
            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Lab Exams: " + report.getTotalLabExams());
            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Hospitalizations: " + report.getTotalHospitalizations());
            sheet.createRow(rowNum++).createCell(0).setCellValue("Total Triages: " + report.getTotalTriages());

            rowNum++; // Empty row

            // Top diagnoses
            if (report.getTopDiagnoses() != null && !report.getTopDiagnoses().isEmpty()) {
                Row diagnosisHeader = sheet.createRow(rowNum++);
                diagnosisHeader.createCell(0).setCellValue("Top Diagnoses");

                Row headerRow = sheet.createRow(rowNum++);
                String[] headers = {"Diagnosis", "Count", "Percentage"};
                for (int i = 0; i < headers.length; i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                for (ClinicalStatisticsDTO.DiagnosisStatDTO diagnosis : report.getTopDiagnoses()) {
                    Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(diagnosis.getDiagnosis());
                    row.createCell(1).setCellValue(diagnosis.getCount());
                    row.createCell(2).setCellValue(String.format("%.1f%%", diagnosis.getPercentage()));
                }
            }

            // Auto-size columns
            for (int i = 0; i < 3; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}
