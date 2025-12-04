# Diagramas - Sistema Hospitalario

<p align="center">
  <img src="https://img.shields.io/badge/Mermaid-Diagrams-FF3670?style=for-the-badge&logo=mermaid&logoColor=white" alt="Mermaid"/>
  <img src="https://img.shields.io/badge/UML-Documentation-007ACC?style=for-the-badge" alt="UML"/>
</p>

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Diagramas Disponibles](#diagramas-disponibles)
- [Como Visualizar](#como-visualizar)
- [Resumen de Arquitectura](#resumen-de-arquitectura)
- [Resumen del Modelo de Datos](#resumen-del-modelo-de-datos)
- [Resumen de Autenticacion](#resumen-de-autenticacion)

---

## Descripcion

Esta carpeta contiene la documentacion tecnica del Sistema de Gestion Hospitalaria en formato de diagramas. Todos los diagramas estan escritos en sintaxis Mermaid, lo que permite visualizarlos directamente en GitHub, GitLab, VS Code o cualquier visor compatible.

---

## Diagramas Disponibles

| Archivo | Tipo | Descripcion |
|---------|------|-------------|
| [architecture.md](architecture.md) | Diagrama de Componentes | Arquitectura general del sistema Electron + Spring Boot |
| [er_diagram.md](er_diagram.md) | Diagrama ER | Modelo completo de base de datos (26 tablas) |
| [sequence_auth.md](sequence_auth.md) | Diagrama de Secuencia | Flujos de autenticacion JWT |

---

## Como Visualizar

### GitHub / GitLab

Los archivos Markdown con bloques Mermaid se renderizan automaticamente en GitHub y GitLab. Simplemente navega al archivo y el diagrama se mostrara.

### VS Code

1. Instalar la extension "Markdown Preview Mermaid Support"
2. Abrir el archivo .md
3. Presionar `Ctrl+Shift+V` para ver la preview

### Mermaid Live Editor

1. Ir a [mermaid.live](https://mermaid.live)
2. Copiar el contenido del bloque mermaid
3. Pegar en el editor para visualizar y exportar

### Linea de Comandos

```bash
# Instalar mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generar imagen PNG
mmdc -i architecture.md -o architecture.png

# Generar imagen SVG
mmdc -i er_diagram.md -o er_diagram.svg

# Generar PDF
mmdc -i sequence_auth.md -o sequence_auth.pdf
```

---

## Resumen de Arquitectura

### Stack Tecnologico

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  Electron 31 + React 18 + TypeScript + Redux + Ant Design       │
└─────────────────────────────────────┬───────────────────────────┘
                                      │ REST API (HTTP/JSON)
┌─────────────────────────────────────┴───────────────────────────┐
│                         BACKEND                                  │
│  Spring Boot 3.2 + Spring Security + JWT + JPA/Hibernate        │
└─────────────────────────────────────┬───────────────────────────┘
                                      │ JDBC
┌─────────────────────────────────────┴───────────────────────────┐
│                       BASE DE DATOS                              │
│                      PostgreSQL 15                               │
└─────────────────────────────────────────────────────────────────┘
```

### Capas del Sistema

| Capa | Componentes |
|------|-------------|
| Presentacion | Electron, React, Redux Toolkit, React Query, Ant Design |
| API | Spring Boot Controllers, DTOs, Validaciones |
| Negocio | Spring Services, Logica de dominio |
| Seguridad | Spring Security, JWT Filter, BCrypt |
| Persistencia | Spring Data JPA, Hibernate, Repositories |
| Datos | PostgreSQL, Indices, Constraints |

Ver diagrama completo en: [architecture.md](architecture.md)

---

## Resumen del Modelo de Datos

### Entidades Principales (26 tablas)

| Modulo | Tablas |
|--------|--------|
| Usuarios | users, doctors, module_permissions |
| Pacientes | patients, clinical_histories, allergies, chronic_diseases |
| Citas | appointments |
| Triaje | triages, vital_signs |
| Hospitalizacion | hospitalizations, beds, nursing_observations |
| Clinico | medical_notes, prescriptions, prescription_items, lab_exams, lab_results, referrals |
| Archivos | clinical_files, file_access_logs |

### Relaciones Clave

```
USERS ----||--o| DOCTORS           (1:1)
PATIENTS ----||--o{ APPOINTMENTS   (1:N)
DOCTORS ----||--o{ APPOINTMENTS    (1:N)
PATIENTS ----||--|| CLINICAL_HISTORIES (1:1)
PATIENTS ----||--o{ ALLERGIES      (1:N)
HOSPITALIZATIONS }o--|| BEDS       (N:1)
PRESCRIPTIONS ----||--o{ PRESCRIPTION_ITEMS (1:N)
LAB_EXAMS ----||--o{ LAB_RESULTS   (1:N)
```

Ver diagrama completo en: [er_diagram.md](er_diagram.md)

---

## Resumen de Autenticacion

### Flujo de Login

```
Usuario → React → API Service → AuthController → AuthService → DB
                                      ↓
                                   JwtUtil
                                      ↓
                              JWT Token (24h)
                                      ↓
                              Redux Store
                                      ↓
                              localStorage
```

### Flujo de Peticion Autenticada

```
React → HTTP Interceptor → JwtAuthFilter → JwtUtil → SecurityContext
                                                          ↓
                                                    @PreAuthorize
                                                          ↓
                                                     Controller
                                                          ↓
                                                      Service
                                                          ↓
                                                     Repository
                                                          ↓
                                                     PostgreSQL
```

### Roles del Sistema

| Rol | Acceso |
|-----|--------|
| ADMIN | Acceso total |
| DOCTOR | Pacientes, citas, notas, recetas, reportes |
| NURSE | Triaje, signos vitales, observaciones |
| RECEPTIONIST | Pacientes, citas, admisiones |
| LAB_TECH | Examenes, resultados |

Ver diagrama completo en: [sequence_auth.md](sequence_auth.md)

---

## Convenciones

### Colores en Diagramas

| Color | Uso |
|-------|-----|
| Azul | Componentes Frontend |
| Verde | Componentes Backend |
| Naranja | Base de Datos |
| Rojo | Seguridad |
| Gris | Infraestructura |

### Nomenclatura

| Tipo | Convencion | Ejemplo |
|------|------------|---------|
| Entidades | PascalCase | Patient, MedicalNote |
| Tablas | snake_case | patients, medical_notes |
| Endpoints | kebab-case | /api/medical-notes |
| Componentes | PascalCase | PatientList, LoginForm |

---

## Referencias

| Recurso | URL |
|---------|-----|
| Documentacion Mermaid | [mermaid.js.org](https://mermaid.js.org/) |
| Diagramas ER | [mermaid.js.org/syntax/entityRelationshipDiagram](https://mermaid.js.org/syntax/entityRelationshipDiagram.html) |
| Diagramas de Secuencia | [mermaid.js.org/syntax/sequenceDiagram](https://mermaid.js.org/syntax/sequenceDiagram.html) |
| Flowcharts | [mermaid.js.org/syntax/flowchart](https://mermaid.js.org/syntax/flowchart.html) |
