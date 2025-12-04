# Sistema Hospitalario - Backend API

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" alt="Spring" width="80" height="80"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" alt="Java" width="80" height="80"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="80" height="80"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Maven-3.8+-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white" alt="Maven"/>
</p>

<p align="center">
  <a href="https://github.com/Yonsn76/hospital-system-java">
    <img src="https://img.shields.io/badge/Repositorio-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo"/>
  </a>
</p>

---

## Tabla de Contenidos

1. [Descripcion General](#descripcion-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalacion y Configuracion](#instalacion-y-configuracion)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Modulos del Sistema](#modulos-del-sistema)
7. [API Endpoints](#api-endpoints)
8. [Seguridad y Autenticacion](#seguridad-y-autenticacion)
9. [Base de Datos](#base-de-datos)
10. [Exportacion de Reportes](#exportacion-de-reportes)
11. [Comandos Utiles](#comandos-utiles)

---

## Descripcion General

API REST empresarial desarrollada con Spring Boot para la gestion integral de un sistema hospitalario. El sistema proporciona funcionalidades completas para la administracion de pacientes, citas medicas, hospitalizaciones, triaje, recetas, examenes de laboratorio, notas medicas y reportes clinicos.

<p align="center">
  <img src="https://raw.githubusercontent.com/patternfly/patternfly-design/master/pattern-library/images/hospital-icon.png" alt="Hospital" width="120"/>
</p>

### Caracteristicas Principales

| Caracteristica | Descripcion |
|----------------|-------------|
| Autenticacion JWT | Tokens seguros con expiracion configurable |
| Control de Acceso RBAC | Roles y permisos granulares por modulo |
| Gestion Clinica Completa | Pacientes, citas, hospitalizaciones, triaje |
| Expediente Electronico | Historial clinico, notas medicas, evoluciones |
| Laboratorio | Solicitud y seguimiento de examenes |
| Recetas Medicas | Prescripciones con control de estado |
| Reportes | Exportacion a PDF y Excel |
| Auditoria | Registro de accesos a expedientes |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Frontend)                        │
│                    Electron + React + TypeScript                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SPRING BOOT APPLICATION                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Controllers │  │  Security   │  │     JWT Filter          │  │
│  │   (REST)    │  │   Config    │  │                         │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                      │                │
│         ▼                ▼                      ▼                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      SERVICE LAYER                          ││
│  │  (Logica de Negocio, Validaciones, Transformaciones)        ││
│  └──────────────────────────┬──────────────────────────────────┘│
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    REPOSITORY LAYER                         ││
│  │              (Spring Data JPA / Hibernate)                  ││
│  └──────────────────────────┬──────────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────────┘
                              │ JDBC
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        POSTGRESQL DATABASE                       │
│                         (hospital_db)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requisitos Previos

| Componente | Version Minima | Recomendada |
|------------|----------------|-------------|
| Java JDK | 17 | 17 LTS |
| Maven | 3.8 | 3.9+ |
| PostgreSQL | 14 | 15+ |

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original-wordmark.svg" alt="Java" width="60"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/maven/maven-original.svg" alt="Maven" width="60"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg" alt="PostgreSQL" width="60"/>
</p>

---

## Instalacion y Configuracion

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Yonsn76/hospital-system-java.git
cd hospital-system-java/backend
```

### 2. Crear Base de Datos

```sql
CREATE DATABASE hospital_db;
```

Ejecutar los scripts de esquema:

```bash
psql -U postgres -d hospital_db -f database/schema.sql
psql -U postgres -d hospital_db -f database/clinical_schema.sql
psql -U postgres -d hospital_db -f database/seed_data.sql
```

### 3. Configurar Variables

Editar `src/main/resources/application.properties`:

```properties
# Servidor
server.port=2026

# Base de Datos
spring.datasource.url=jdbc:postgresql://localhost:5432/hospital_db
spring.datasource.username=postgres
spring.datasource.password=tu_password

# JWT (CAMBIAR EN PRODUCCION)
jwt.secret=tu_clave_secreta_muy_larga_y_segura_de_256_bits
jwt.expiration=86400000
```

### 4. Compilar y Ejecutar

```bash
# Compilar
mvn clean install

# Ejecutar
mvn spring-boot:run
```

La API estara disponible en: `http://localhost:2026`

---

## Estructura del Proyecto

```
backend/
├── database/
│   ├── schema.sql              # Esquema principal
│   ├── clinical_schema.sql     # Esquema clinico extendido
│   └── seed_data.sql           # Datos de prueba
│
├── src/main/java/com/hospital/system/
│   │
│   ├── config/                 # Configuraciones
│   │   ├── ApplicationConfig.java
│   │   ├── DataInitializer.java
│   │   └── SecurityConfig.java
│   │
│   ├── controller/             # Controladores REST (21)
│   │   ├── AuthController.java
│   │   ├── PatientController.java
│   │   ├── AppointmentController.java
│   │   ├── DoctorController.java
│   │   ├── TriageController.java
│   │   ├── HospitalizationController.java
│   │   ├── PrescriptionController.java
│   │   ├── LabExamController.java
│   │   ├── MedicalNoteController.java
│   │   ├── ClinicalHistoryController.java
│   │   ├── ClinicalFileController.java
│   │   ├── NursingController.java
│   │   ├── ReferralController.java
│   │   ├── ReportController.java
│   │   ├── UserController.java
│   │   ├── ModulePermissionController.java
│   │   └── ...
│   │
│   ├── dto/                    # Data Transfer Objects (64)
│   │   ├── Auth (Request/Response)
│   │   ├── Patient (Request/Response)
│   │   ├── Appointment (Request/Response)
│   │   ├── Triage (Request/Response)
│   │   ├── Hospitalization (Request/Response)
│   │   ├── Prescription (Request/Response)
│   │   ├── LabExam (Request/Response)
│   │   ├── MedicalNote (Request/Response)
│   │   ├── ClinicalHistory (Request/Response)
│   │   ├── VitalSigns (Request/Response)
│   │   ├── Referral (Request/Response)
│   │   ├── Report DTOs
│   │   └── ...
│   │
│   ├── model/                  # Entidades JPA (45)
│   │   ├── User.java
│   │   ├── Doctor.java
│   │   ├── Patient.java
│   │   ├── Appointment.java
│   │   ├── Triage.java
│   │   ├── Hospitalization.java
│   │   ├── Bed.java
│   │   ├── Prescription.java
│   │   ├── LabExam.java
│   │   ├── MedicalNote.java
│   │   ├── ClinicalHistory.java
│   │   ├── ClinicalFile.java
│   │   ├── VitalSigns.java
│   │   ├── Allergy.java
│   │   ├── ChronicDisease.java
│   │   ├── NursingObservation.java
│   │   ├── Referral.java
│   │   ├── Enums (Status, Priority, etc.)
│   │   └── ...
│   │
│   ├── repository/             # Repositorios JPA (26)
│   │   └── [Entidad]Repository.java
│   │
│   ├── security/               # Seguridad JWT
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtUtil.java
│   │
│   ├── service/                # Servicios (24)
│   │   ├── AuthService.java
│   │   ├── PatientService.java
│   │   ├── AppointmentService.java
│   │   ├── TriageService.java
│   │   ├── HospitalizationService.java
│   │   ├── BedService.java
│   │   ├── PrescriptionService.java
│   │   ├── LabExamService.java
│   │   ├── MedicalNoteService.java
│   │   ├── ClinicalHistoryService.java
│   │   ├── ClinicalFileService.java
│   │   ├── VitalSignsService.java
│   │   ├── AllergyService.java
│   │   ├── ChronicDiseaseService.java
│   │   ├── NursingObservationService.java
│   │   ├── ReferralService.java
│   │   ├── ReportService.java
│   │   ├── ReportExportService.java
│   │   ├── FileAccessLogService.java
│   │   └── ...
│   │
│   └── HospitalSystemApplication.java
│
├── src/main/resources/
│   └── application.properties
│
└── pom.xml
```

---

## Modulos del Sistema

### Gestion de Pacientes
| Funcionalidad | Descripcion |
|---------------|-------------|
| Registro | Alta de pacientes con datos demograficos |
| Busqueda | Por nombre, documento, telefono |
| Historial | Acceso al expediente clinico completo |

### Citas Medicas
| Funcionalidad | Descripcion |
|---------------|-------------|
| Programacion | Agendar citas con doctores |
| Estados | SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED |
| Filtros | Por doctor, paciente, fecha, estado |

### Triaje
| Funcionalidad | Descripcion |
|---------------|-------------|
| Clasificacion | Prioridad por gravedad (RESUSCITATION, EMERGENCY, URGENT, LESS_URGENT, NON_URGENT) |
| Signos Vitales | Registro de presion, temperatura, pulso, etc. |
| Cola de Atencion | Ordenamiento por prioridad |

### Hospitalizacion
| Funcionalidad | Descripcion |
|---------------|-------------|
| Ingreso | Admision de pacientes |
| Camas | Gestion de disponibilidad y asignacion |
| Transferencias | Movimiento entre areas |
| Alta | Registro de egreso con tipo de alta |

### Recetas Medicas
| Funcionalidad | Descripcion |
|---------------|-------------|
| Prescripcion | Medicamentos con dosis e instrucciones |
| Estados | ACTIVE, DISPENSED, CANCELLED, EXPIRED |
| Impresion | Formato para farmacia |

### Laboratorio
| Funcionalidad | Descripcion |
|---------------|-------------|
| Solicitud | Ordenes de examenes |
| Prioridad | ROUTINE, URGENT, STAT |
| Resultados | Carga y consulta de resultados |

### Notas Medicas
| Funcionalidad | Descripcion |
|---------------|-------------|
| Tipos | Consulta, evolucion, interconsulta, egreso |
| Versionado | Historial de modificaciones |
| Firma | Registro del medico responsable |

### Expediente Clinico
| Funcionalidad | Descripcion |
|---------------|-------------|
| Historial | Antecedentes, alergias, enfermedades cronicas |
| Archivos | Documentos adjuntos (imagenes, PDFs) |
| Auditoria | Log de accesos al expediente |

### Enfermeria
| Funcionalidad | Descripcion |
|---------------|-------------|
| Observaciones | Notas de enfermeria |
| Signos Vitales | Monitoreo periodico |
| Medicacion | Administracion de medicamentos |

### Referencias
| Funcionalidad | Descripcion |
|---------------|-------------|
| Interconsulta | Derivacion a especialistas |
| Externa | Referencia a otros centros |
| Seguimiento | Estados y respuestas |

### Reportes
| Funcionalidad | Descripcion |
|---------------|-------------|
| Estadisticas | Metricas clinicas y operativas |
| Productividad | Rendimiento por medico |
| Exportacion | PDF y Excel |

---

## API Endpoints

### Autenticacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesion |
| POST | `/api/auth/register` | Registrar usuario |

### Pacientes `/api/patients`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todos |
| GET | `/{id}` | Obtener por ID |
| GET | `/search?query=` | Buscar pacientes |
| POST | `/` | Crear paciente |
| PUT | `/{id}` | Actualizar paciente |
| DELETE | `/{id}` | Eliminar paciente |

### Citas `/api/appointments`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todas |
| GET | `/{id}` | Obtener por ID |
| GET | `/doctor/{id}` | Por doctor |
| GET | `/patient/{id}` | Por paciente |
| GET | `/date/{date}` | Por fecha |
| POST | `/` | Crear cita |
| PUT | `/{id}` | Actualizar cita |
| PATCH | `/{id}/status` | Cambiar estado |
| DELETE | `/{id}` | Cancelar cita |

### Triaje `/api/triage`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todos |
| GET | `/{id}` | Obtener por ID |
| GET | `/queue` | Cola de atencion |
| GET | `/patient/{id}` | Por paciente |
| POST | `/` | Crear triaje |
| PUT | `/{id}` | Actualizar |
| PATCH | `/{id}/priority` | Cambiar prioridad |
| PATCH | `/{id}/status` | Cambiar estado |

### Hospitalizacion `/api/hospitalizations`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar activas |
| GET | `/{id}` | Obtener por ID |
| GET | `/patient/{id}` | Por paciente |
| POST | `/` | Ingresar paciente |
| POST | `/{id}/discharge` | Dar de alta |
| POST | `/{id}/transfer` | Transferir cama |

### Camas `/api/beds`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todas |
| GET | `/available` | Disponibles |
| GET | `/area/{area}` | Por area |
| POST | `/` | Crear cama |
| PATCH | `/{id}/status` | Cambiar estado |

### Recetas `/api/prescriptions`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todas |
| GET | `/{id}` | Obtener por ID |
| GET | `/patient/{id}` | Por paciente |
| GET | `/{id}/print` | Formato impresion |
| POST | `/` | Crear receta |
| PATCH | `/{id}/status` | Cambiar estado |

### Laboratorio `/api/lab-exams`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todos |
| GET | `/{id}` | Obtener por ID |
| GET | `/patient/{id}` | Por paciente |
| GET | `/pending` | Pendientes |
| POST | `/` | Solicitar examen |
| POST | `/{id}/results` | Cargar resultados |
| PATCH | `/{id}/status` | Cambiar estado |

### Notas Medicas `/api/medical-notes`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todas |
| GET | `/{id}` | Obtener por ID |
| GET | `/patient/{id}` | Por paciente |
| GET | `/{id}/versions` | Historial versiones |
| POST | `/` | Crear nota |
| PUT | `/{id}` | Actualizar nota |

### Historial Clinico `/api/clinical-history`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/patient/{id}` | Historial completo |
| POST | `/patient/{id}` | Crear/actualizar |
| POST | `/patient/{id}/allergies` | Agregar alergia |
| POST | `/patient/{id}/diseases` | Agregar enfermedad |
| DELETE | `/allergies/{id}` | Eliminar alergia |
| DELETE | `/diseases/{id}` | Eliminar enfermedad |

### Expediente Clinico `/api/clinical-files`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/patient/{id}` | Archivos del paciente |
| GET | `/{id}` | Obtener archivo |
| GET | `/{id}/access-log` | Log de accesos |
| POST | `/` | Subir archivo |
| DELETE | `/{id}` | Eliminar archivo |

### Enfermeria `/api/nursing`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/observations/patient/{id}` | Observaciones |
| GET | `/vital-signs/patient/{id}` | Signos vitales |
| POST | `/observations` | Crear observacion |
| POST | `/vital-signs` | Registrar signos |

### Referencias `/api/referrals`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar todas |
| GET | `/{id}` | Obtener por ID |
| GET | `/patient/{id}` | Por paciente |
| POST | `/` | Crear referencia |
| PATCH | `/{id}/status` | Actualizar estado |

### Reportes `/api/reports`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/statistics` | Estadisticas generales |
| GET | `/attendance` | Reporte de atenciones |
| GET | `/productivity` | Productividad medica |
| GET | `/frequent-patients` | Pacientes frecuentes |
| GET | `/export/pdf` | Exportar a PDF |
| GET | `/export/excel` | Exportar a Excel |

### Usuarios `/api/users`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/` | Listar usuarios |
| GET | `/{id}` | Obtener por ID |
| PUT | `/{id}` | Actualizar usuario |
| DELETE | `/{id}` | Eliminar usuario |

### Permisos `/api/permissions`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/role/{role}` | Permisos por rol |
| POST | `/` | Asignar permiso |
| DELETE | `/{id}` | Revocar permiso |

---

## Seguridad y Autenticacion

### Roles del Sistema

| Rol | Descripcion | Nivel de Acceso |
|-----|-------------|-----------------|
| ADMIN | Administrador del sistema | Acceso total |
| DOCTOR | Medico | Pacientes, citas, notas, recetas |
| NURSE | Enfermera | Triaje, signos vitales, observaciones |
| RECEPTIONIST | Recepcionista | Pacientes, citas, admisiones |
| LAB_TECH | Tecnico laboratorio | Examenes, resultados |

### Flujo de Autenticacion

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Cliente │         │   API    │         │   JWT    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /auth/login  │                    │
     │  {user, password}  │                    │
     │───────────────────>│                    │
     │                    │  Validar           │
     │                    │  credenciales      │
     │                    │───────────────────>│
     │                    │                    │
     │                    │  Generar Token     │
     │                    │<───────────────────│
     │                    │                    │
     │  {token, role}     │                    │
     │<───────────────────│                    │
     │                    │                    │
     │  GET /api/patients │                    │
     │  Authorization:    │                    │
     │  Bearer <token>    │                    │
     │───────────────────>│                    │
     │                    │  Validar Token     │
     │                    │───────────────────>│
     │                    │                    │
     │                    │  Token valido      │
     │                    │<───────────────────│
     │                    │                    │
     │  [patients]        │                    │
     │<───────────────────│                    │
     │                    │                    │
```

### Configuracion JWT

```properties
jwt.secret=clave_secreta_256_bits
jwt.expiration=86400000  # 24 horas en ms
```

---

## Base de Datos

### Diagrama Entidad-Relacion

Ver diagrama completo en: `../diagrams/er_diagram.md`

### Tablas Principales

| Tabla | Descripcion |
|-------|-------------|
| users | Usuarios del sistema |
| doctors | Informacion de medicos |
| patients | Datos de pacientes |
| appointments | Citas medicas |
| triages | Registros de triaje |
| hospitalizations | Ingresos hospitalarios |
| beds | Camas disponibles |
| prescriptions | Recetas medicas |
| prescription_items | Items de receta |
| lab_exams | Examenes de laboratorio |
| lab_results | Resultados de examenes |
| medical_notes | Notas medicas |
| medical_note_versions | Versiones de notas |
| clinical_histories | Historiales clinicos |
| clinical_files | Archivos clinicos |
| allergies | Alergias de pacientes |
| chronic_diseases | Enfermedades cronicas |
| vital_signs | Signos vitales |
| nursing_observations | Observaciones enfermeria |
| referrals | Referencias medicas |
| file_access_logs | Auditoria de accesos |
| module_permissions | Permisos por modulo |

---

## Exportacion de Reportes

### Dependencias

```xml
<!-- PDF - iText 7 -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
</dependency>

<!-- Excel - Apache POI -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### Formatos Disponibles

| Formato | Endpoint | Content-Type |
|---------|----------|--------------|
| PDF | `/api/reports/export/pdf` | application/pdf |
| Excel | `/api/reports/export/excel` | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |

---

## Comandos Utiles

```bash
# Compilar sin tests
mvn clean install -DskipTests

# Ejecutar aplicacion
mvn spring-boot:run

# Ejecutar tests
mvn test

# Generar JAR
mvn clean package -DskipTests

# Ejecutar JAR
java -jar target/hospital-system-0.0.1-SNAPSHOT.jar

# Ver arbol de dependencias
mvn dependency:tree

# Actualizar dependencias
mvn versions:display-dependency-updates
```

---

## Notas de Produccion

| Aspecto | Recomendacion |
|---------|---------------|
| JWT Secret | Usar variable de entorno, minimo 256 bits |
| Base de Datos | Cambiar `ddl-auto` a `validate`, usar migraciones |
| HTTPS | Configurar SSL/TLS obligatorio |
| Logs | Configurar nivel apropiado, rotacion de archivos |
| Monitoreo | Integrar Spring Actuator |
| Backup | Configurar respaldos automaticos de BD |

---

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" alt="Spring" width="40"/>
  <br/>
  Desarrollado con Spring Boot
</p>
