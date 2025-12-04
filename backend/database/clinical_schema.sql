-- =====================================================
-- Hospital Management System - Clinical Schema Extension
-- PostgreSQL Script
-- =====================================================

-- This script extends the base schema with clinical modules:
-- Historia Clínica, Notas Médicas, Prescripciones, Laboratorio,
-- Enfermería, Archivos Clínicos, Hospitalización, Triaje, Derivaciones

-- =====================================================
-- ENUM TYPES FOR CLINICAL MODULES
-- =====================================================

-- Drop existing clinical enum types if they exist
DROP TYPE IF EXISTS allergy_severity_enum CASCADE;
DROP TYPE IF EXISTS disease_status_enum CASCADE;
DROP TYPE IF EXISTS prescription_status_enum CASCADE;
DROP TYPE IF EXISTS exam_priority_enum CASCADE;
DROP TYPE IF EXISTS exam_status_enum CASCADE;
DROP TYPE IF EXISTS file_type_enum CASCADE;
DROP TYPE IF EXISTS bed_status_enum CASCADE;
DROP TYPE IF EXISTS hospitalization_status_enum CASCADE;
DROP TYPE IF EXISTS discharge_type_enum CASCADE;
DROP TYPE IF EXISTS triage_priority_enum CASCADE;
DROP TYPE IF EXISTS triage_status_enum CASCADE;
DROP TYPE IF EXISTS referral_urgency_enum CASCADE;
DROP TYPE IF EXISTS referral_status_enum CASCADE;
DROP TYPE IF EXISTS observation_type_enum CASCADE;
DROP TYPE IF EXISTS access_action_enum CASCADE;

-- AllergySeverity: Severity levels for patient allergies
CREATE TYPE allergy_severity_enum AS ENUM ('MILD', 'MODERATE', 'SEVERE');

-- DiseaseStatus: Status of chronic diseases
CREATE TYPE disease_status_enum AS ENUM ('ACTIVE', 'CONTROLLED', 'RESOLVED');

-- PrescriptionStatus: Status of prescriptions
CREATE TYPE prescription_status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- ExamPriority: Priority levels for laboratory exams
CREATE TYPE exam_priority_enum AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- ExamStatus: Status of laboratory exams
CREATE TYPE exam_status_enum AS ENUM ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- FileType: Types of clinical files
CREATE TYPE file_type_enum AS ENUM ('RADIOGRAFIA', 'CONSENTIMIENTO', 'LABORATORIO', 'OTRO');

-- BedStatus: Status of hospital beds
CREATE TYPE bed_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');

-- HospitalizationStatus: Status of hospitalizations
CREATE TYPE hospitalization_status_enum AS ENUM ('ACTIVE', 'DISCHARGED', 'TRANSFERRED');

-- DischargeType: Types of patient discharge
CREATE TYPE discharge_type_enum AS ENUM ('MEDICAL', 'VOLUNTARY', 'TRANSFER', 'DECEASED');


-- TriagePriority: Priority levels for triage (1-5 scale)
CREATE TYPE triage_priority_enum AS ENUM ('RESUSCITATION', 'EMERGENT', 'URGENT', 'LESS_URGENT', 'NON_URGENT');

-- TriageStatus: Status of triage records
CREATE TYPE triage_status_enum AS ENUM ('WAITING', 'IN_PROGRESS', 'ATTENDED', 'LEFT');

-- ReferralUrgency: Urgency levels for referrals
CREATE TYPE referral_urgency_enum AS ENUM ('ROUTINE', 'PRIORITY', 'URGENT');

-- ReferralStatus: Status of referrals
CREATE TYPE referral_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- ObservationType: Types of nursing observations
CREATE TYPE observation_type_enum AS ENUM ('TREATMENT', 'GENERAL', 'ALERT');

-- AccessAction: Types of file access actions for audit
CREATE TYPE access_action_enum AS ENUM ('VIEW', 'DOWNLOAD');

-- =====================================================
-- HISTORIA CLÍNICA TABLES
-- =====================================================

-- Drop existing clinical tables if they exist (in order by dependencies)
DROP TABLE IF EXISTS file_access_logs CASCADE;
DROP TABLE IF EXISTS clinical_files CASCADE;
DROP TABLE IF EXISTS nursing_observations CASCADE;
DROP TABLE IF EXISTS vital_signs CASCADE;
DROP TABLE IF EXISTS lab_results CASCADE;
DROP TABLE IF EXISTS lab_exams CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_note_versions CASCADE;
DROP TABLE IF EXISTS medical_notes CASCADE;
DROP TABLE IF EXISTS clinical_evolutions CASCADE;
DROP TABLE IF EXISTS chronic_diseases CASCADE;
DROP TABLE IF EXISTS allergies CASCADE;
DROP TABLE IF EXISTS clinical_histories CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS triage CASCADE;
DROP TABLE IF EXISTS bed_transfers CASCADE;
DROP TABLE IF EXISTS hospitalizations CASCADE;
DROP TABLE IF EXISTS beds CASCADE;

-- Table: clinical_histories
-- Stores the main clinical history record for each patient
CREATE TABLE clinical_histories (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE,
    antecedentes TEXT,
    observaciones TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clinical_histories_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Table: allergies
-- Stores patient allergies with severity levels
CREATE TABLE allergies (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    allergy_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allergies_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT chk_allergies_severity CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE'))
);

-- Table: chronic_diseases
-- Stores patient chronic diseases with diagnosis date and status
CREATE TABLE chronic_diseases (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    diagnosis_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chronic_diseases_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT chk_chronic_diseases_status CHECK (status IN ('ACTIVE', 'CONTROLLED', 'RESOLVED'))
);

-- Table: clinical_evolutions
-- Stores evolution entries linked to appointments
CREATE TABLE clinical_evolutions (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT,
    doctor_id BIGINT NOT NULL,
    evolution_notes TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clinical_evolutions_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_clinical_evolutions_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT fk_clinical_evolutions_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);


-- =====================================================
-- NOTAS MÉDICAS TABLES
-- =====================================================

-- Table: medical_notes
-- Stores medical notes created during consultations
CREATE TABLE medical_notes (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT,
    doctor_id BIGINT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT NOT NULL,
    follow_up_date DATE,
    follow_up_instructions TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_notes_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_medical_notes_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT fk_medical_notes_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Table: medical_note_versions
-- Stores version history for medical notes
CREATE TABLE medical_note_versions (
    id BIGSERIAL PRIMARY KEY,
    medical_note_id BIGINT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT NOT NULL,
    modified_by BIGINT NOT NULL,
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_note_versions_note FOREIGN KEY (medical_note_id) REFERENCES medical_notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_medical_note_versions_user FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- PRESCRIPCIONES TABLES
-- =====================================================

-- Table: prescriptions
-- Stores prescription records
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_prescriptions_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT chk_prescriptions_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
);

-- Table: prescription_items
-- Stores individual medication items in a prescription
CREATE TABLE prescription_items (
    id BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dose VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    CONSTRAINT fk_prescription_items_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- =====================================================
-- LABORATORIO TABLES
-- =====================================================

-- Table: lab_exams
-- Stores laboratory exam requests
CREATE TABLE lab_exams (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    requesting_doctor_id BIGINT NOT NULL,
    appointment_id BIGINT,
    exam_type VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    clinical_indication TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_lab_exams_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_lab_exams_doctor FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_lab_exams_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT chk_lab_exams_priority CHECK (priority IN ('ROUTINE', 'URGENT', 'STAT')),
    CONSTRAINT chk_lab_exams_status CHECK (status IN ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

-- Table: lab_results
-- Stores laboratory exam results
CREATE TABLE lab_results (
    id BIGSERIAL PRIMARY KEY,
    lab_exam_id BIGINT NOT NULL,
    result_value TEXT,
    reference_range VARCHAR(255),
    is_abnormal BOOLEAN DEFAULT FALSE,
    notes TEXT,
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lab_results_exam FOREIGN KEY (lab_exam_id) REFERENCES lab_exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_lab_results_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);


-- =====================================================
-- ENFERMERÍA TABLES
-- =====================================================

-- Table: vital_signs
-- Stores patient vital signs recorded by nurses
CREATE TABLE vital_signs (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    nurse_id BIGINT NOT NULL,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    temperature DECIMAL(4,1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    weight DECIMAL(5,2),
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vital_signs_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_vital_signs_nurse FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: nursing_observations
-- Stores nursing observations and notes
CREATE TABLE nursing_observations (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    nurse_id BIGINT NOT NULL,
    observation_type VARCHAR(20) NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nursing_observations_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_nursing_observations_nurse FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_nursing_observations_type CHECK (observation_type IN ('TREATMENT', 'GENERAL', 'ALERT'))
);

-- =====================================================
-- ARCHIVOS CLÍNICOS TABLES
-- =====================================================

-- Table: clinical_files
-- Stores clinical file metadata
CREATE TABLE clinical_files (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clinical_files_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_clinical_files_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_clinical_files_type CHECK (file_type IN ('RADIOGRAFIA', 'CONSENTIMIENTO', 'LABORATORIO', 'OTRO'))
);

-- Table: file_access_logs
-- Stores audit logs for clinical file access
CREATE TABLE file_access_logs (
    id BIGSERIAL PRIMARY KEY,
    clinical_file_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    CONSTRAINT fk_file_access_logs_file FOREIGN KEY (clinical_file_id) REFERENCES clinical_files(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_access_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_file_access_logs_action CHECK (action IN ('VIEW', 'DOWNLOAD'))
);

-- =====================================================
-- HOSPITALIZACIÓN TABLES
-- =====================================================

-- Table: beds
-- Stores hospital bed information
CREATE TABLE beds (
    id BIGSERIAL PRIMARY KEY,
    bed_number VARCHAR(50) NOT NULL UNIQUE,
    area VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    current_hospitalization_id BIGINT,
    CONSTRAINT chk_beds_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'))
);

-- Table: hospitalizations
-- Stores patient hospitalization records
CREATE TABLE hospitalizations (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    admitting_doctor_id BIGINT NOT NULL,
    bed_id BIGINT,
    admission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP,
    admission_reason TEXT NOT NULL,
    discharge_type VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_hospitalizations_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_hospitalizations_doctor FOREIGN KEY (admitting_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_hospitalizations_bed FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL,
    CONSTRAINT chk_hospitalizations_discharge_type CHECK (discharge_type IS NULL OR discharge_type IN ('MEDICAL', 'VOLUNTARY', 'TRANSFER', 'DECEASED')),
    CONSTRAINT chk_hospitalizations_status CHECK (status IN ('ACTIVE', 'DISCHARGED', 'TRANSFERRED'))
);

-- Add foreign key from beds to hospitalizations (circular reference)
ALTER TABLE beds ADD CONSTRAINT fk_beds_hospitalization 
    FOREIGN KEY (current_hospitalization_id) REFERENCES hospitalizations(id) ON DELETE SET NULL;

-- Table: bed_transfers
-- Stores bed transfer records during hospitalization
CREATE TABLE bed_transfers (
    id BIGSERIAL PRIMARY KEY,
    hospitalization_id BIGINT NOT NULL,
    from_bed_id BIGINT NOT NULL,
    to_bed_id BIGINT NOT NULL,
    transferred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    CONSTRAINT fk_bed_transfers_hospitalization FOREIGN KEY (hospitalization_id) REFERENCES hospitalizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_bed_transfers_from_bed FOREIGN KEY (from_bed_id) REFERENCES beds(id) ON DELETE CASCADE,
    CONSTRAINT fk_bed_transfers_to_bed FOREIGN KEY (to_bed_id) REFERENCES beds(id) ON DELETE CASCADE
);


-- =====================================================
-- TRIAJE TABLE
-- =====================================================

-- Table: triage
-- Stores triage records with priority classification
CREATE TABLE triage (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    nurse_id BIGINT NOT NULL,
    chief_complaint TEXT NOT NULL,
    initial_assessment TEXT,
    priority_level VARCHAR(20) NOT NULL,
    recommended_destination VARCHAR(255),
    vital_signs_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    arrived_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    triaged_at TIMESTAMP,
    attended_at TIMESTAMP,
    CONSTRAINT fk_triage_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_triage_nurse FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_triage_vital_signs FOREIGN KEY (vital_signs_id) REFERENCES vital_signs(id) ON DELETE SET NULL,
    CONSTRAINT chk_triage_priority CHECK (priority_level IN ('RESUSCITATION', 'EMERGENT', 'URGENT', 'LESS_URGENT', 'NON_URGENT')),
    CONSTRAINT chk_triage_status CHECK (status IN ('WAITING', 'IN_PROGRESS', 'ATTENDED', 'LEFT'))
);

-- =====================================================
-- DERIVACIONES TABLE
-- =====================================================

-- Table: referrals
-- Stores patient referrals to other specialists or services
CREATE TABLE referrals (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    referring_doctor_id BIGINT NOT NULL,
    destination_doctor_id BIGINT,
    destination_specialty VARCHAR(255),
    external_service VARCHAR(255),
    reason TEXT NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resulting_appointment_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_referrals_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_referrals_referring_doctor FOREIGN KEY (referring_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CONSTRAINT fk_referrals_destination_doctor FOREIGN KEY (destination_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    CONSTRAINT fk_referrals_appointment FOREIGN KEY (resulting_appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT chk_referrals_urgency CHECK (urgency IN ('ROUTINE', 'PRIORITY', 'URGENT')),
    CONSTRAINT chk_referrals_status CHECK (status IN ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'))
);

-- =====================================================
-- INDEXES FOR CLINICAL TABLES
-- =====================================================

-- Clinical History indexes
CREATE INDEX idx_clinical_histories_patient ON clinical_histories(patient_id);
CREATE INDEX idx_allergies_patient ON allergies(patient_id);
CREATE INDEX idx_chronic_diseases_patient ON chronic_diseases(patient_id);
CREATE INDEX idx_chronic_diseases_status ON chronic_diseases(status);
CREATE INDEX idx_clinical_evolutions_patient ON clinical_evolutions(patient_id);
CREATE INDEX idx_clinical_evolutions_doctor ON clinical_evolutions(doctor_id);
CREATE INDEX idx_clinical_evolutions_appointment ON clinical_evolutions(appointment_id);
CREATE INDEX idx_clinical_evolutions_created ON clinical_evolutions(created_at);

-- Medical Notes indexes
CREATE INDEX idx_medical_notes_patient ON medical_notes(patient_id);
CREATE INDEX idx_medical_notes_doctor ON medical_notes(doctor_id);
CREATE INDEX idx_medical_notes_appointment ON medical_notes(appointment_id);
CREATE INDEX idx_medical_notes_created ON medical_notes(created_at);
CREATE INDEX idx_medical_note_versions_note ON medical_note_versions(medical_note_id);

-- Prescriptions indexes
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_created ON prescriptions(created_at);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);

-- Lab Exams indexes
CREATE INDEX idx_lab_exams_patient ON lab_exams(patient_id);
CREATE INDEX idx_lab_exams_doctor ON lab_exams(requesting_doctor_id);
CREATE INDEX idx_lab_exams_status ON lab_exams(status);
CREATE INDEX idx_lab_exams_priority ON lab_exams(priority);
CREATE INDEX idx_lab_results_exam ON lab_results(lab_exam_id);

-- Vital Signs indexes
CREATE INDEX idx_vital_signs_patient ON vital_signs(patient_id);
CREATE INDEX idx_vital_signs_recorded ON vital_signs(recorded_at);
CREATE INDEX idx_nursing_observations_patient ON nursing_observations(patient_id);
CREATE INDEX idx_nursing_observations_type ON nursing_observations(observation_type);

-- Clinical Files indexes
CREATE INDEX idx_clinical_files_patient ON clinical_files(patient_id);
CREATE INDEX idx_clinical_files_type ON clinical_files(file_type);
CREATE INDEX idx_clinical_files_uploaded ON clinical_files(uploaded_at);
CREATE INDEX idx_file_access_logs_file ON file_access_logs(clinical_file_id);
CREATE INDEX idx_file_access_logs_user ON file_access_logs(user_id);

-- Hospitalization indexes
CREATE INDEX idx_beds_area ON beds(area);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_hospitalizations_patient ON hospitalizations(patient_id);
CREATE INDEX idx_hospitalizations_status ON hospitalizations(status);
CREATE INDEX idx_hospitalizations_admission ON hospitalizations(admission_date);
CREATE INDEX idx_bed_transfers_hospitalization ON bed_transfers(hospitalization_id);

-- Triage indexes
CREATE INDEX idx_triage_patient ON triage(patient_id);
CREATE INDEX idx_triage_status ON triage(status);
CREATE INDEX idx_triage_priority ON triage(priority_level);
CREATE INDEX idx_triage_arrived ON triage(arrived_at);

-- Referrals indexes
CREATE INDEX idx_referrals_patient ON referrals(patient_id);
CREATE INDEX idx_referrals_referring_doctor ON referrals(referring_doctor_id);
CREATE INDEX idx_referrals_destination_doctor ON referrals(destination_doctor_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_urgency ON referrals(urgency);

-- =====================================================
-- END OF CLINICAL SCHEMA EXTENSION
-- =====================================================
