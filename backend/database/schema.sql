-- =====================================================
-- Hospital Management System - Database Schema
-- PostgreSQL Script
-- =====================================================

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE hospital_db;

-- Conectar a la base de datos
-- \c hospital_db;

-- =====================================================
-- TIPOS ENUM
-- =====================================================

-- Eliminar tipos si existen
DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS appointment_status_enum CASCADE;
DROP TYPE IF EXISTS resource_type_enum CASCADE;
DROP TYPE IF EXISTS resource_status_enum CASCADE;

-- Crear tipos enum
CREATE TYPE role_enum AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST');
CREATE TYPE appointment_status_enum AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE resource_type_enum AS ENUM ('BED', 'ROOM', 'EQUIPMENT', 'AMBULANCE');
CREATE TYPE resource_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER');

-- =====================================================
-- TABLAS
-- =====================================================

-- Eliminar tablas si existen (en orden por dependencias)
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabla: users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(50)
);

-- Tabla: doctors
CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    specialization VARCHAR(255),
    license_number VARCHAR(255),
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla: patients
CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(50),
    contact_number VARCHAR(50),
    address TEXT
);

-- Tabla: appointments
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Tabla: medical_records
CREATE TABLE medical_records (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    prescription TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_records_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_medical_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Tabla: resources
CREATE TABLE resources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);

CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_time ON appointments(appointment_time);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_created ON medical_records(created_at);

CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_status ON resources(status);

-- =====================================================
-- CONSTRAINTS ADICIONALES (CHECK)
-- =====================================================

ALTER TABLE users ADD CONSTRAINT chk_users_role 
    CHECK (role IN ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'));

ALTER TABLE appointments ADD CONSTRAINT chk_appointments_status 
    CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'));

ALTER TABLE resources ADD CONSTRAINT chk_resources_type 
    CHECK (type IN ('BED', 'ROOM', 'EQUIPMENT', 'AMBULANCE'));

ALTER TABLE resources ADD CONSTRAINT chk_resources_status 
    CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'));

-- =====================================================
-- TABLA: module_permissions (Permisos de módulos)
-- =====================================================

DROP TABLE IF EXISTS module_permissions CASCADE;

CREATE TABLE module_permissions (
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    username VARCHAR(255),
    module_id VARCHAR(100) NOT NULL,
    permission_type VARCHAR(20) NOT NULL,
    CONSTRAINT chk_permission_type CHECK (permission_type IN ('ADDED', 'REMOVED'))
);

-- Índices para module_permissions
CREATE INDEX idx_module_permissions_role ON module_permissions(role);
CREATE INDEX idx_module_permissions_username ON module_permissions(username);
CREATE INDEX idx_module_permissions_module ON module_permissions(module_id);

-- Constraint único para evitar duplicados
CREATE UNIQUE INDEX idx_module_permissions_unique_role 
    ON module_permissions(role, module_id) WHERE username IS NULL;
CREATE UNIQUE INDEX idx_module_permissions_unique_user 
    ON module_permissions(username, module_id) WHERE username IS NOT NULL;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
