-- =====================================================
-- Hospital Management System - Seed Data
-- PostgreSQL Script
-- =====================================================

-- Limpiar datos existentes
TRUNCATE TABLE medical_records, appointments, doctors, patients, resources, users RESTART IDENTITY CASCADE;

-- =====================================================
-- USUARIOS
-- =====================================================
-- Password: password123 (BCrypt encoded)
INSERT INTO users (username, password, email, role, first_name, last_name, phone_number) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf94WqaHvmFj3t9Wxa', 'admin@hospital.com', 'ADMIN', 'System', 'Administrator', '555-0100'),
('dr.garcia', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf94WqaHvmFj3t9Wxa', 'garcia@hospital.com', 'DOCTOR', 'Carlos', 'García', '555-0101'),
('dr.martinez', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf94WqaHvmFj3t9Wxa', 'martinez@hospital.com', 'DOCTOR', 'María', 'Martínez', '555-0102'),
('dr.lopez', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf94WqaHvmFj3t9Wxa', 'lopez@hospital.com', 'DOCTOR', 'Juan', 'López', '555-0103'),
('nurse.ana', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf94WqaHvmFj3t9Wxa', 'ana@hospital.com', 'NURSE', 'Ana', 'Rodríguez', '555-0104'),
('recep.pedro', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQb9tLGjPsZf94WqaHvmFj3t9Wxa', 'pedro@hospital.com', 'RECEPTIONIST', 'Pedro', 'Sánchez', '555-0105');

-- =====================================================
-- DOCTORES
-- =====================================================
INSERT INTO doctors (user_id, specialization, license_number) VALUES
(2, 'Cardiología', 'MED-2024-001'),
(3, 'Pediatría', 'MED-2024-002'),
(4, 'Medicina General', 'MED-2024-003');

-- =====================================================
-- PACIENTES
-- =====================================================
INSERT INTO patients (first_name, last_name, date_of_birth, gender, contact_number, address) VALUES
('Roberto', 'Fernández', '1985-03-15', 'Masculino', '555-1001', 'Calle Principal 123'),
('Laura', 'González', '1990-07-22', 'Femenino', '555-1002', 'Avenida Central 456'),
('Miguel', 'Torres', '1978-11-08', 'Masculino', '555-1003', 'Plaza Mayor 789'),
('Carmen', 'Ruiz', '2015-05-30', 'Femenino', '555-1004', 'Calle Secundaria 321'),
('José', 'Hernández', '1965-09-12', 'Masculino', '555-1005', 'Boulevard Norte 654');

-- =====================================================
-- CITAS
-- =====================================================
INSERT INTO appointments (patient_id, doctor_id, appointment_time, status, reason) VALUES
(1, 1, '2024-12-05 09:00:00', 'SCHEDULED', 'Revisión cardíaca anual'),
(2, 2, '2024-12-05 10:30:00', 'CONFIRMED', 'Consulta general'),
(3, 3, '2024-12-05 11:00:00', 'SCHEDULED', 'Dolor de espalda'),
(4, 2, '2024-12-06 09:30:00', 'SCHEDULED', 'Control pediátrico'),
(5, 1, '2024-12-06 14:00:00', 'CONFIRMED', 'Seguimiento hipertensión'),
(1, 3, '2024-11-20 10:00:00', 'COMPLETED', 'Gripe'),
(2, 1, '2024-11-15 15:00:00', 'COMPLETED', 'Electrocardiograma');

-- =====================================================
-- REGISTROS MÉDICOS
-- =====================================================
INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, prescription, created_at) VALUES
(1, 3, 'Gripe estacional', 'Reposo y líquidos abundantes', 'Paracetamol 500mg cada 8 horas', '2024-11-20 10:30:00'),
(2, 1, 'Arritmia leve', 'Monitoreo continuo', 'Betabloqueantes según indicación', '2024-11-15 15:45:00'),
(3, 3, 'Lumbalgia mecánica', 'Fisioterapia y ejercicios', 'Ibuprofeno 400mg cada 12 horas', '2024-11-10 11:20:00'),
(5, 1, 'Hipertensión arterial', 'Control de dieta y ejercicio', 'Losartán 50mg diario', '2024-11-01 14:30:00');

-- =====================================================
-- RECURSOS
-- =====================================================
INSERT INTO resources (name, type, status, location) VALUES
('Cama 101', 'BED', 'AVAILABLE', 'Piso 1 - Habitación 101'),
('Cama 102', 'BED', 'OCCUPIED', 'Piso 1 - Habitación 102'),
('Cama 201', 'BED', 'AVAILABLE', 'Piso 2 - Habitación 201'),
('Quirófano A', 'ROOM', 'AVAILABLE', 'Piso 3'),
('Quirófano B', 'ROOM', 'MAINTENANCE', 'Piso 3'),
('Sala de Rayos X', 'ROOM', 'AVAILABLE', 'Piso 1'),
('Ecógrafo Portátil', 'EQUIPMENT', 'AVAILABLE', 'Almacén Central'),
('Desfibrilador 1', 'EQUIPMENT', 'AVAILABLE', 'Emergencias'),
('Ambulancia 1', 'AMBULANCE', 'AVAILABLE', 'Estacionamiento'),
('Ambulancia 2', 'AMBULANCE', 'OCCUPIED', 'En servicio');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
