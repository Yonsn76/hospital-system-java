# Backend - Sistema Hospitalario

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen?style=for-the-badge&logo=springboot" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk" alt="Java"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/JWT-Security-red?style=for-the-badge&logo=jsonwebtokens" alt="JWT"/>
</p>

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Requisitos Previos](#requisitos-previos)
- [Configuracion](#configuracion)
- [Ejecucion](#ejecucion)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Seguridad y Roles](#seguridad-y-roles)
- [Base de Datos](#base-de-datos)

---

## Descripcion

API REST desarrollada con Spring Boot para la gestion de un sistema hospitalario. Incluye autenticacion JWT, control de acceso basado en roles (RBAC) y operaciones CRUD para pacientes, citas, registros medicos y recursos.

---

## Requisitos Previos

| Requisito | Version |
|-----------|---------|
| Java JDK | 17+ |
| Maven | 3.8+ |
| PostgreSQL | 15+ |

---

## Configuracion

### 1. Base de Datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE hospital_db;
```

### 2. Variables de Entorno

Editar `src/main/resources/application.properties`:

```properties
# Configuracion de Base de Datos
spring.datasource.url=jdbc:postgresql://localhost:5432/hospital_db
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password

# JWT Secret (cambiar en produccion)
jwt.secret=tu_clave_secreta_muy_larga_y_segura
jwt.expiration=86400000
```

---

## Ejecucion

### Usando Maven

```bash
# Compilar el proyecto
mvn clean install

# Ejecutar la aplicacion
mvn spring-boot:run
```

### Usando JAR

```bash
# Generar JAR
mvn clean package -DskipTests

# Ejecutar JAR
java -jar target/hospital-system-0.0.1-SNAPSHOT.jar
```

La API estara disponible en: `http://localhost:8080`

---

## Estructura del Proyecto

```
src/main/java/com/hospital/system/
|
|-- config/                    # Configuraciones de Spring
|   |-- ApplicationConfig.java # Configuracion general de beans
|   |-- DataInitializer.java   # Datos iniciales de prueba
|   |-- SecurityConfig.java    # Configuracion de Spring Security
|
|-- controller/                # Controladores REST
|   |-- AppointmentController.java
|   |-- AuthController.java
|   |-- MedicalRecordController.java
|   |-- PatientController.java
|   |-- ResourceController.java
|
|-- dto/                       # Data Transfer Objects
|   |-- AppointmentRequest.java
|   |-- AppointmentResponse.java
|   |-- AuthRequest.java
|   |-- AuthResponse.java
|   |-- MedicalRecordRequest.java
|   |-- MedicalRecordResponse.java
|   |-- PatientRequest.java
|   |-- PatientResponse.java
|   |-- RegisterRequest.java
|   |-- ResourceRequest.java
|   |-- ResourceResponse.java
|
|-- model/                     # Entidades JPA
|   |-- Appointment.java
|   |-- AppointmentStatus.java
|   |-- Doctor.java
|   |-- MedicalRecord.java
|   |-- Patient.java
|   |-- Resource.java
|   |-- ResourceStatus.java
|   |-- ResourceType.java
|   |-- Role.java
|   |-- User.java
|
|-- repository/                # Repositorios JPA
|   |-- AppointmentRepository.java
|   |-- DoctorRepository.java
|   |-- MedicalRecordRepository.java
|   |-- PatientRepository.java
|   |-- ResourceRepository.java
|   |-- UserRepository.java
|
|-- security/                  # Seguridad JWT
|   |-- JwtAuthenticationFilter.java
|   |-- JwtUtil.java
|
|-- service/                   # Logica de negocio
|   |-- AppointmentService.java
|   |-- AuthService.java
|   |-- CustomUserDetailsService.java
|   |-- MedicalRecordService.java
|   |-- PatientService.java
|   |-- ResourceService.java
|
|-- HospitalSystemApplication.java  # Clase principal
```

---

## API Endpoints

### Autenticacion

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesion |
| POST | `/api/auth/register` | Registrar usuario |

### Pacientes

| Metodo | Endpoint | Roles Permitidos |
|--------|----------|------------------|
| GET | `/api/patients` | ADMIN, RECEPTIONIST, NURSE |
| GET | `/api/patients/{id}` | ADMIN, RECEPTIONIST, NURSE |
| POST | `/api/patients` | ADMIN, RECEPTIONIST |
| PUT | `/api/patients/{id}` | ADMIN, RECEPTIONIST |
| DELETE | `/api/patients/{id}` | ADMIN |

### Citas

| Metodo | Endpoint | Roles Permitidos |
|--------|----------|------------------|
| GET | `/api/appointments` | ADMIN, NURSE, RECEPTIONIST |
| GET | `/api/appointments/{id}` | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| GET | `/api/appointments/doctor/{id}` | ADMIN, DOCTOR |
| GET | `/api/appointments/patient/{id}` | ADMIN, NURSE, RECEPTIONIST |
| POST | `/api/appointments` | ADMIN, RECEPTIONIST |
| PUT | `/api/appointments/{id}` | ADMIN, RECEPTIONIST |
| PATCH | `/api/appointments/{id}/status` | ADMIN, DOCTOR, RECEPTIONIST |
| DELETE | `/api/appointments/{id}` | ADMIN |

### Registros Medicos

| Metodo | Endpoint | Roles Permitidos |
|--------|----------|------------------|
| GET | `/api/medical-records/patient/{id}` | ADMIN, DOCTOR, NURSE |
| GET | `/api/medical-records/doctor/{id}` | ADMIN, DOCTOR |
| POST | `/api/medical-records` | ADMIN, DOCTOR |

### Recursos

| Metodo | Endpoint | Roles Permitidos |
|--------|----------|------------------|
| GET | `/api/resources` | ADMIN |
| GET | `/api/resources/type/{type}` | ADMIN |
| POST | `/api/resources` | ADMIN |
| PATCH | `/api/resources/{id}/status` | ADMIN |
| DELETE | `/api/resources/{id}` | ADMIN |

---

## Seguridad y Roles

El sistema implementa RBAC (Role-Based Access Control) con 4 roles:

| Rol | Descripcion |
|-----|-------------|
| **ADMIN** | Acceso completo a todas las funcionalidades |
| **DOCTOR** | Gestiona sus citas y registros medicos |
| **NURSE** | Visualiza citas y pacientes (solo lectura) |
| **RECEPTIONIST** | Gestiona pacientes y citas |

### Flujo de Autenticacion

1. El usuario envia credenciales a `/api/auth/login`
2. El servidor valida y genera un token JWT
3. El cliente incluye el token en el header `Authorization: Bearer <token>`
4. El filtro JWT valida el token y extrae el rol del usuario
5. Las anotaciones `@PreAuthorize` verifican los permisos

---

## Base de Datos

### Diagrama ER

Ver el diagrama completo en: `../diagrams/er_diagram.md`

### Tablas Principales

- **users** - Usuarios del sistema
- **doctors** - Informacion de doctores
- **patients** - Datos de pacientes
- **appointments** - Citas medicas
- **medical_records** - Registros medicos
- **resources** - Recursos hospitalarios

---

## Notas Importantes

> **Produccion**: Cambiar `jwt.secret` por una clave segura y configurar HTTPS.

> **Base de Datos**: El modo `ddl-auto=update` crea/actualiza tablas automaticamente. En produccion usar `validate` o migraciones.

> **CORS**: Configurado para permitir peticiones desde `http://localhost:4200` (Angular).

---

## Comandos Utiles

```bash
# Ejecutar tests
mvn test

# Limpiar y compilar
mvn clean compile

# Ver dependencias
mvn dependency:tree

# Generar documentacion
mvn javadoc:javadoc
```
