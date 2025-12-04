<p align="center">
  <img src="https://raw.githubusercontent.com/Yonsn76/hospital-system-java/main/front_elect/src/renderer/src/assets/logo.png" alt="Sistema Hospitalario" width="200"/>
</p>

<h1 align="center">Sistema de Gestion Hospitalaria</h1>

<p align="center">
  Plataforma integral para la administracion clinica y operativa de centros de salud
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Electron-31.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"/>
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
</p>

<p align="center">
  <a href="https://github.com/Yonsn76/hospital-system-java">
    <img src="https://img.shields.io/badge/Repositorio-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  <img src="https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge" alt="Licencia"/>
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge" alt="Estado"/>
</p>

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Caracteristicas](#caracteristicas)
- [Arquitectura](#arquitectura)
- [Stack Tecnologico](#stack-tecnologico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Documentacion](#documentacion)
- [Licencia](#licencia)

---

## Descripcion

Esta plataforma integral de gestion hospitalaria moderniza la administracion clinica y administrativa de instituciones de salud. Su objetivo principal es salvaguardar la integridad del paciente mediante la prevencion automatizada de errores medicos y optimizar la asignacion de recursos criticos como camas y quirofanos.

Al centralizar la informacion, facilita la toma de decisiones informadas y garantiza el cumplimiento normativo mediante un registro inmutable de todas las actividades realizadas por el personal.

---

## Caracteristicas

### Gestion Clinica

| Modulo | Descripcion |
|--------|-------------|
| Pacientes | Registro completo, busqueda avanzada, historial medico |
| Citas Medicas | Programacion, confirmacion, seguimiento de estados |
| Triaje | Clasificacion por prioridad, cola de atencion |
| Historia Clinica | Expediente electronico, antecedentes, alergias |
| Notas Medicas | Consultas, evoluciones, interconsultas |
| Prescripciones | Recetas medicas con control de estado |
| Laboratorio | Solicitud y seguimiento de examenes |
| Derivaciones | Referencias a especialistas |

### Gestion Administrativa

| Modulo | Descripcion |
|--------|-------------|
| Hospitalizacion | Ingresos, altas, transferencias |
| Gestion de Camas | Disponibilidad, asignacion por area |
| Archivos Clinicos | Documentos digitales, auditoria de accesos |
| Control de Accesos | Roles y permisos granulares |
| Reportes | Estadisticas, productividad, exportacion PDF/Excel |

### Funcionalidades Generales

| Caracteristica | Descripcion |
|----------------|-------------|
| Autenticacion JWT | Tokens seguros con expiracion configurable |
| Multirol | Admin, Doctor, Enfermera, Recepcionista, Laboratorio |
| Tema Claro/Oscuro | Interfaz personalizable |
| Multiplataforma | Windows, macOS, Linux |
| Tiempo Real | Dashboard con metricas actualizadas |

---

## Arquitectura

### Diagrama General del Sistema

```mermaid
graph TD
    subgraph Cliente ["Cliente (Desktop)"]
        Electron["Electron App"]
        React["React + TypeScript"]
        Redux["Redux Toolkit"]
        Query["React Query"]
    end

    subgraph Servidor ["Servidor (Backend)"]
        Spring["Spring Boot 3.2"]
        Security["Spring Security"]
        JPA["Spring Data JPA"]
    end

    subgraph BaseDatos ["Base de Datos"]
        PostgreSQL[("PostgreSQL 15")]
    end

    Electron --> React
    React --> Redux
    React --> Query
    Query -->|REST API| Spring
    Spring --> Security
    Security --> JPA
    JPA --> PostgreSQL
```

### Arquitectura por Capas

```mermaid
graph TB
    subgraph Presentacion ["Capa de Presentacion"]
        Desktop["Electron + React"]
        UI["Ant Design + TailwindCSS"]
    end

    subgraph Estado ["Gestion de Estado"]
        ClientState["Redux Toolkit<br/>(Estado Local)"]
        ServerState["React Query<br/>(Estado Servidor)"]
    end

    subgraph API ["Capa API"]
        REST["REST Controllers"]
        DTO["DTOs"]
        Validation["Validaciones"]
    end

    subgraph Negocio ["Capa de Negocio"]
        Services["Services"]
        Logic["Logica de Dominio"]
    end

    subgraph Seguridad ["Capa de Seguridad"]
        JWT["JWT Authentication"]
        RBAC["Control de Acceso"]
    end

    subgraph Persistencia ["Capa de Persistencia"]
        Repos["Repositories"]
        Entities["Entities"]
    end

    subgraph Datos ["Capa de Datos"]
        DB[("PostgreSQL")]
    end

    Desktop --> UI
    UI --> ClientState
    UI --> ServerState
    ServerState --> REST
    REST --> DTO
    DTO --> Services
    Services --> Logic
    JWT --> Services
    RBAC --> Services
    Services --> Repos
    Repos --> Entities
    Entities --> DB
```

### Comunicacion Frontend-Backend

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuario
    participant Electron as Electron App
    participant React as React Component
    participant Query as React Query
    participant API as API Service
    participant Spring as Spring Boot
    participant DB as PostgreSQL

    User->>Electron: Interaccion
    Electron->>React: Evento UI
    React->>Query: useQuery/useMutation
    Query->>API: HTTP Request
    API->>API: Add JWT Header
    API->>Spring: REST Call
    Spring->>Spring: Validate Token
    Spring->>Spring: Check Permissions
    Spring->>DB: Query
    DB-->>Spring: Result
    Spring-->>API: JSON Response
    API-->>Query: Data
    Query->>Query: Cache Update
    Query-->>React: Re-render
    React-->>Electron: Update UI
    Electron-->>User: Visual Feedback
```

### Flujo de Autenticacion

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuario
    participant App as Electron App
    participant Auth as AuthController
    participant Service as AuthService
    participant JWT as JwtUtil
    participant DB as PostgreSQL

    User->>App: Login (user, pass)
    App->>Auth: POST /api/auth/login
    Auth->>Service: authenticate()
    Service->>DB: findByUsername()
    DB-->>Service: User Entity
    Service->>Service: validatePassword()
    
    alt Credenciales Invalidas
        Service-->>Auth: Exception
        Auth-->>App: 401 Unauthorized
        App-->>User: Error Message
    else Credenciales Validas
        Service->>JWT: generateToken()
        JWT-->>Service: JWT Token
        Service-->>Auth: AuthResponse
        Auth-->>App: 200 + {token, role}
        App->>App: Store Token
        App-->>User: Redirect Dashboard
    end
```

### Modelo de Datos (Simplificado)

```mermaid
erDiagram
    USERS ||--o| DOCTORS : "es"
    PATIENTS ||--o{ APPOINTMENTS : "tiene"
    DOCTORS ||--o{ APPOINTMENTS : "atiende"
    PATIENTS ||--o{ TRIAGES : "tiene"
    PATIENTS ||--o{ HOSPITALIZATIONS : "tiene"
    BEDS ||--o{ HOSPITALIZATIONS : "asignada"
    PATIENTS ||--o{ PRESCRIPTIONS : "tiene"
    PATIENTS ||--o{ LAB_EXAMS : "tiene"
    PATIENTS ||--o{ MEDICAL_NOTES : "tiene"
    PATIENTS ||--|| CLINICAL_HISTORIES : "tiene"

    USERS {
        bigint id PK
        varchar username
        varchar password
        varchar role
    }

    PATIENTS {
        bigint id PK
        varchar first_name
        varchar last_name
        varchar document_number
    }

    DOCTORS {
        bigint id PK
        bigint user_id FK
        varchar specialization
    }

    APPOINTMENTS {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        timestamp date
        varchar status
    }

    TRIAGES {
        bigint id PK
        bigint patient_id FK
        varchar priority
        varchar status
    }

    HOSPITALIZATIONS {
        bigint id PK
        bigint patient_id FK
        bigint bed_id FK
        varchar status
    }

    BEDS {
        bigint id PK
        varchar bed_number
        varchar status
    }
```

---

## Stack Tecnologico

### Backend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| Java | 17 LTS | Lenguaje principal |
| Spring Boot | 3.2.3 | Framework backend |
| Spring Security | 6.x | Autenticacion y autorizacion |
| Spring Data JPA | 3.x | Persistencia de datos |
| PostgreSQL | 15+ | Base de datos relacional |
| JWT | - | Tokens de autenticacion |
| Maven | 3.8+ | Gestion de dependencias |
| iText 7 | 7.2.5 | Generacion de PDFs |
| Apache POI | 5.2.5 | Generacion de Excel |

### Frontend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| Electron | 31.0.0 | Framework desktop |
| React | 18.3.1 | Libreria UI |
| TypeScript | 5.5.0 | Tipado estatico |
| Vite | 5.4.0 | Build tool |
| Redux Toolkit | 2.2.5 | Estado global |
| React Query | 5.60.0 | Server state |
| Ant Design | 5.21.0 | Componentes UI |
| TailwindCSS | 3.4.0 | Estilos utilitarios |
| React Router | 6.26.0 | Navegacion |
| Vitest | 2.0.0 | Testing |

<p align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" alt="Java" width="50"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" alt="Spring" width="50"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="50"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/electron/electron-original.svg" alt="Electron" width="50"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React" width="50"/>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="TypeScript" width="50"/>
</p>

---

## Estructura del Proyecto

```
hospital-system-java/
│
├── backend/                          # API REST (Spring Boot)
│   ├── database/                     # Scripts SQL
│   ├── src/main/java/                # Codigo fuente Java
│   └── pom.xml                       # Dependencias Maven
│
├── front_elect/                      # Aplicacion Desktop (Electron)
│   ├── packages/shared/              # Tipos compartidos
│   ├── src/
│   │   ├── main/                     # Proceso principal Electron
│   │   ├── preload/                  # Bridge de seguridad
│   │   └── renderer/                 # Interfaz React
│   └── package.json                  # Dependencias npm
│
├── diagrams/                         # Documentacion tecnica
│   ├── architecture.md               # Diagrama de arquitectura
│   ├── er_diagram.md                 # Diagrama entidad-relacion
│   └── sequence_auth.md              # Secuencia de autenticacion
│
├── LICENSE                           # Licencia MIT
└── readme.md                         # Este archivo
```

### Diagrama de Estructura

```mermaid
graph TD
    Root["hospital-system-java/"]
    
    Root --> Backend["backend/"]
    Root --> Frontend["front_elect/"]
    Root --> Diagrams["diagrams/"]
    Root --> License["LICENSE"]
    Root --> Readme["readme.md"]
    
    Backend --> DB["database/"]
    Backend --> Src["src/main/java/"]
    Backend --> Pom["pom.xml"]
    
    DB --> Schema["schema.sql"]
    DB --> Clinical["clinical_schema.sql"]
    DB --> Seed["seed_data.sql"]
    
    Src --> Config["config/"]
    Src --> Controller["controller/"]
    Src --> DTO["dto/"]
    Src --> Model["model/"]
    Src --> Repository["repository/"]
    Src --> Security["security/"]
    Src --> Service["service/"]
    
    Frontend --> Packages["packages/shared/"]
    Frontend --> SrcF["src/"]
    Frontend --> Package["package.json"]
    
    SrcF --> Main["main/"]
    SrcF --> Preload["preload/"]
    SrcF --> Renderer["renderer/"]
    
    Renderer --> Components["components/"]
    Renderer --> Pages["pages/"]
    Renderer --> Store["store/"]
    Renderer --> Services["services/"]
```

---

## Requisitos

### Software Necesario

| Componente | Version Minima | Descarga |
|------------|----------------|----------|
| Java JDK | 17 | [Oracle](https://www.oracle.com/java/technologies/downloads/) / [OpenJDK](https://adoptium.net/) |
| Node.js | 18.0.0 | [nodejs.org](https://nodejs.org/) |
| PostgreSQL | 14 | [postgresql.org](https://www.postgresql.org/download/) |
| Maven | 3.8 | [maven.apache.org](https://maven.apache.org/download.cgi) |
| Git | 2.x | [git-scm.com](https://git-scm.com/downloads) |

### Verificar Instalacion

```bash
java --version
node --version
psql --version
mvn --version
git --version
```

---

## Instalacion

### Diagrama de Instalacion

```mermaid
flowchart TD
    Start["Inicio"]
    Start --> Clone["1. Clonar Repositorio"]
    Clone --> DB["2. Crear Base de Datos"]
    DB --> Schema["3. Ejecutar Scripts SQL"]
    Schema --> Config["4. Configurar Backend"]
    Config --> Backend["5. Iniciar Backend"]
    Backend --> Frontend["6. Instalar Frontend"]
    Frontend --> Dev["7. Iniciar Desarrollo"]
    Dev --> End["Sistema Listo"]
```

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Yonsn76/hospital-system-java.git
cd hospital-system-java
```

### 2. Configurar Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE hospital_db;
```

```bash
# Ejecutar scripts de esquema
psql -U postgres -d hospital_db -f backend/database/schema.sql
psql -U postgres -d hospital_db -f backend/database/clinical_schema.sql
psql -U postgres -d hospital_db -f backend/database/seed_data.sql
```

### 3. Configurar Backend

Editar `backend/src/main/resources/application.properties`:

```properties
server.port=2026
spring.datasource.url=jdbc:postgresql://localhost:5432/hospital_db
spring.datasource.username=postgres
spring.datasource.password=tu_password
jwt.secret=tu_clave_secreta_256_bits
```

### 4. Iniciar Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

El servidor estara disponible en: `http://localhost:2026`

### 5. Iniciar Frontend

```bash
cd front_elect
npm install
npm run dev
```

---

## Documentacion

| Documento | Descripcion | Ubicacion |
|-----------|-------------|-----------|
| Backend API | Documentacion completa del API REST | [backend/README.md](backend/README.md) |
| Frontend | Documentacion de la aplicacion Electron | [front_elect/README.md](front_elect/README.md) |
| Arquitectura | Diagrama de arquitectura del sistema | [diagrams/architecture.md](diagrams/architecture.md) |
| Base de Datos | Diagrama entidad-relacion | [diagrams/er_diagram.md](diagrams/er_diagram.md) |
| Autenticacion | Flujo de autenticacion JWT | [diagrams/sequence_auth.md](diagrams/sequence_auth.md) |

---

## Roles del Sistema

```mermaid
graph TD
    subgraph Roles ["Roles del Sistema"]
        Admin["ADMIN<br/>Acceso Total"]
        Doctor["DOCTOR<br/>Clinico + Reportes"]
        Nurse["NURSE<br/>Triaje + Enfermeria"]
        Reception["RECEPTIONIST<br/>Citas + Pacientes"]
        Lab["LAB_TECH<br/>Laboratorio"]
    end

    subgraph Modulos ["Modulos"]
        Dashboard["Dashboard"]
        Patients["Pacientes"]
        Appointments["Citas"]
        Triage["Triaje"]
        Clinical["Clinico"]
        Reports["Reportes"]
        Settings["Configuracion"]
    end

    Admin --> Dashboard
    Admin --> Patients
    Admin --> Appointments
    Admin --> Triage
    Admin --> Clinical
    Admin --> Reports
    Admin --> Settings

    Doctor --> Dashboard
    Doctor --> Patients
    Doctor --> Appointments
    Doctor --> Clinical
    Doctor --> Reports

    Nurse --> Dashboard
    Nurse --> Patients
    Nurse --> Triage

    Reception --> Dashboard
    Reception --> Patients
    Reception --> Appointments

    Lab --> Dashboard
    Lab --> Clinical
```

| Rol | Codigo | Acceso |
|-----|--------|--------|
| Administrador | ADMIN | Acceso total al sistema |
| Doctor | DOCTOR | Pacientes, citas, notas, recetas, reportes |
| Enfermera | NURSE | Triaje, signos vitales, observaciones |
| Recepcionista | RECEPTIONIST | Pacientes, citas, admisiones |
| Laboratorio | LAB_TECH | Examenes, resultados |

---

## Licencia

Este proyecto esta bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para mas detalles.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/Yonsn76/hospital-system-java/main/front_elect/src/renderer/src/assets/logo.png" alt="Logo" width="80"/>
  <br/>
  <sub>Desarrollado con Java, Spring Boot, Electron y React</sub>
</p>
