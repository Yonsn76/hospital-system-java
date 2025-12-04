# Sistema de Gestion Hospitalaria - Frontend

<p align="center">
  <img src="https://img.shields.io/badge/Electron-31.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

<p align="center">
  Aplicacion de escritorio multiplataforma para la gestion integral de centros de salud y hospitales.
  <br>
  Desarrollada con Electron, React y TypeScript.
</p>

---

## Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Caracteristicas](#caracteristicas)
- [Stack Tecnologico](#stack-tecnologico)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
- [Modulos del Sistema](#modulos-del-sistema)
- [Configuracion](#configuracion)
- [Compilacion y Distribucion](#compilacion-y-distribucion)
- [Licencia](#licencia)

---

## Descripcion General

Este proyecto es el frontend del Sistema de Gestion Hospitalaria, una aplicacion de escritorio que permite administrar de forma eficiente todas las operaciones de un centro de salud. La aplicacion se conecta a un backend REST API desarrollado en Spring Boot para la persistencia y logica de negocio.

---

## Caracteristicas

### Modulos Principales
- Gestion completa de pacientes (registro, busqueda, historial)
- Administracion de doctores y especialidades medicas
- Programacion y seguimiento de citas medicas
- Calendario visual interactivo de citas

### Modulos Clinicos
- Historia clinica electronica
- Notas medicas y observaciones
- Prescripciones y recetas medicas
- Ordenes de laboratorio
- Sistema de triaje con prioridades
- Derivaciones a especialistas

### Modulos Administrativos
- Gestion de hospitalizacion
- Administracion de camas hospitalarias
- Archivos clinicos digitales
- Control de accesos por roles

### Funcionalidades Generales
- Dashboard con estadisticas en tiempo real
- Reportes y graficos estadisticos
- Tema claro y oscuro personalizable
- Sistema de autenticacion con JWT
- Soporte multirol (Admin, Doctor, Enfermera, Recepcionista)

---

## Stack Tecnologico

| Categoria          | Tecnologia                                      |
|--------------------|-------------------------------------------------|
| Framework Desktop  | Electron 31.0.0                                 |
| Build Tool         | Electron-Vite 2.3.0                             |
| UI Framework       | React 18.3.1                                    |
| Lenguaje           | TypeScript 5.5.0                                |
| Estado Global      | Redux Toolkit + Redux Persist                   |
| Data Fetching      | TanStack React Query 5.60.0                     |
| Componentes UI     | Ant Design 5.21.0                               |
| Estilos            | TailwindCSS 3.4.0 + Styled Components           |
| Iconos             | Lucide React                                    |
| Routing            | React Router DOM 6.26.0                         |
| Testing            | Vitest 2.0.0                                    |
| Linting            | ESLint 8.57.0 + Prettier 3.3.0                  |
| Git Hooks          | Husky 9.1.0 + Lint-Staged                       |

---

## Requisitos Previos

Antes de comenzar, asegurate de tener instalado:

- Node.js version 18.0.0 o superior
- npm o yarn como gestor de paquetes
- Git para control de versiones

Para verificar las versiones instaladas:

```bash
node --version
npm --version
```

---

## Instalacion

1. Clonar el repositorio:

```bash
git clone https://github.com/Yonsn76/hospital-system-java.git
cd hospital-system-java/front_elect
```

2. Instalar las dependencias:

```bash
npm install
```

3. Configurar las variables de entorno (opcional):

Crear un archivo `.env` en la raiz del proyecto si es necesario configurar la URL del backend.

4. Iniciar en modo desarrollo:

```bash
npm run dev
```

---

## Scripts Disponibles

| Script              | Comando                | Descripcion                                    |
|---------------------|------------------------|------------------------------------------------|
| Desarrollo          | `npm run dev`          | Inicia la aplicacion en modo desarrollo        |
| Preview             | `npm run start`        | Previsualiza la build de produccion            |
| Build               | `npm run build`        | Compila el proyecto para produccion            |
| Build Windows       | `npm run build:win`    | Genera instalador para Windows                 |
| Build macOS         | `npm run build:mac`    | Genera instalador para macOS                   |
| Build Linux         | `npm run build:linux`  | Genera instalador para Linux                   |
| Type Check          | `npm run typecheck`    | Verifica tipos de TypeScript                   |
| Lint                | `npm run lint`         | Ejecuta ESLint y corrige errores               |
| Format              | `npm run format`       | Formatea el codigo con Prettier                |
| Test                | `npm run test`         | Ejecuta los tests una vez                      |
| Test Watch          | `npm run test:watch`   | Ejecuta tests en modo watch                    |

---

## Estructura del Proyecto

```
front_elect/
├── packages/
│   └── shared/                    # Tipos y canales IPC compartidos
│       └── types/                 # Definiciones de tipos TypeScript
│
├── src/
│   ├── main/                      # Proceso Principal (Node.js)
│   │   ├── services/              # Servicios de negocio
│   │   ├── utils/                 # Utilidades
│   │   ├── index.ts               # Entry point del proceso main
│   │   └── ipc.ts                 # Handlers de comunicacion IPC
│   │
│   ├── preload/                   # Bridge seguro Main <-> Renderer
│   │   └── index.ts               # Expone APIs seguras al renderer
│   │
│   └── renderer/                  # Interfaz de Usuario (React)
│       ├── index.html             # HTML principal
│       └── src/
│           ├── assets/            # Imagenes y recursos estaticos
│           ├── components/        # Componentes reutilizables
│           ├── config/            # Configuracion de modulos
│           ├── context/           # Contextos de React (Theme)
│           ├── hooks/             # Custom hooks
│           ├── pages/             # Paginas/Vistas de la aplicacion
│           ├── services/          # Servicios API
│           ├── store/             # Redux store y slices
│           ├── styles/            # Estilos globales CSS
│           ├── App.tsx            # Componente raiz
│           └── main.tsx           # Entry point del renderer
│
├── electron-builder.yml           # Configuracion de electron-builder
├── electron.vite.config.ts        # Configuracion de Vite para Electron
├── tailwind.config.js             # Configuracion de TailwindCSS
├── tsconfig.json                  # Configuracion base de TypeScript
└── package.json                   # Dependencias y scripts
```

---

## Arquitectura

### Arquitectura de Electron

```mermaid
graph TD
    subgraph ElectronApp ["Aplicacion Electron"]
        subgraph MainProcess ["Proceso Main (Node.js)"]
            BrowserWindow["BrowserWindow"]
            IpcMain["ipcMain"]
            Services["Servicios Locales"]
            Store["Electron Store"]
        end

        subgraph PreloadProcess ["Proceso Preload"]
            ContextBridge["contextBridge"]
            IpcRenderer["ipcRenderer"]
        end

        subgraph RendererProcess ["Proceso Renderer (Chromium)"]
            ReactApp["React App"]
            WindowAPI["window.api"]
        end
    end

    BrowserWindow -->|carga| RendererProcess
    IpcMain <-->|invoke/handle| IpcRenderer
    ContextBridge -->|exposeInMainWorld| WindowAPI
    ReactApp -->|usa| WindowAPI
    Services --> Store
```

### Comunicacion IPC

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuario
    participant React as React Component
    participant API as window.api
    participant Preload as Preload Script
    participant Main as Main Process
    participant Service as Service

    User->>React: Interaccion UI
    React->>API: window.api.metodo()
    API->>Preload: contextBridge
    Preload->>Main: ipcRenderer.invoke('canal', datos)
    Main->>Service: Procesar solicitud
    Service-->>Main: Resultado
    Main-->>Preload: Respuesta
    Preload-->>API: Promise resolved
    API-->>React: Datos
    React-->>User: Actualiza UI
```

### Flujo de Datos con Backend

```mermaid
flowchart LR
    subgraph Frontend ["Frontend (Electron)"]
        Component["React Component"]
        Query["React Query"]
        APIService["API Service"]
        Redux["Redux Store"]
    end

    subgraph Backend ["Backend (Spring Boot)"]
        REST["REST API"]
        DB[("PostgreSQL")]
    end

    Component -->|useQuery| Query
    Query -->|fetch| APIService
    APIService -->|HTTP + JWT| REST
    REST -->|JSON| APIService
    APIService -->|cache| Query
    Query -->|data| Component
    Component -->|dispatch| Redux
    Redux -->|state| Component
    REST <--> DB
```

### Gestion de Estado

```mermaid
graph TB
    subgraph ReduxStore ["Redux Store"]
        AuthSlice["authSlice<br/>- user<br/>- token<br/>- isAuthenticated"]
        ModulesSlice["modulesSlice<br/>- permissions<br/>- modules"]
        SettingsSlice["settingsSlice<br/>- theme<br/>- language"]
        UISlice["uiSlice<br/>- sidebarCollapsed<br/>- notifications"]
    end

    subgraph Persistence ["Redux Persist"]
        LocalStorage["localStorage"]
    end

    subgraph ReactQuery ["React Query Cache"]
        Patients["patients"]
        Appointments["appointments"]
        Doctors["doctors"]
    end

    AuthSlice --> LocalStorage
    SettingsSlice --> LocalStorage
    
    ReactQuery -->|Server State| Component["Components"]
    ReduxStore -->|Client State| Component
```

### Flujo de Autenticacion

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuario
    participant Login as Login Page
    participant API as API Service
    participant Backend as Spring Boot
    participant Redux as Redux Store
    participant Storage as localStorage

    User->>Login: Ingresa credenciales
    Login->>API: login(username, password)
    API->>Backend: POST /api/auth/login
    
    alt Credenciales Invalidas
        Backend-->>API: 401 Unauthorized
        API-->>Login: Error
        Login-->>User: Mostrar error
    else Credenciales Validas
        Backend-->>API: {token, user, role}
        API->>Redux: dispatch(loginSuccess)
        Redux->>Storage: Persist token
        Login->>Login: Navigate to Dashboard
        Login-->>User: Mostrar Dashboard
    end
```

### Estructura de Componentes

```mermaid
graph TD
    App["App.tsx"]
    App --> ThemeProvider["ThemeProvider"]
    ThemeProvider --> ConfigProvider["Ant ConfigProvider"]
    ConfigProvider --> Router["HashRouter"]
    
    Router --> Login["Login Page"]
    Router --> Layout["Layout Component"]
    
    Layout --> Sidebar["Sidebar"]
    Layout --> Header["Header"]
    Layout --> Content["Content Area"]
    
    Content --> Dashboard["Dashboard"]
    Content --> Pacientes["Pacientes"]
    Content --> Citas["Citas"]
    Content --> Calendario["Calendario"]
    Content --> Triaje["Triaje"]
    Content --> Hospitalizacion["Hospitalizacion"]
    Content --> Prescripciones["Prescripciones"]
    Content --> Laboratorio["Laboratorio"]
    Content --> Reportes["Reportes"]
    Content --> Configuracion["Configuracion"]
```

---

## Modulos del Sistema

### Diagrama de Modulos

```mermaid
graph LR
    subgraph Principal ["Principal"]
        Dashboard["Dashboard"]
        Citas["Citas"]
        Calendario["Calendario"]
        Pacientes["Pacientes"]
        Doctores["Doctores"]
    end

    subgraph Clinico ["Clinico"]
        Historia["Historia Clinica"]
        Notas["Notas Medicas"]
        Prescripciones["Prescripciones"]
        Laboratorio["Laboratorio"]
        Triaje["Triaje"]
        Derivaciones["Derivaciones"]
    end

    subgraph Administrativo ["Administrativo"]
        Archivos["Archivos Clinicos"]
        Hospitalizacion["Hospitalizacion"]
        Camas["Gestion Camas"]
        Accesos["Gestion Accesos"]
    end

    subgraph Reportes ["Reportes"]
        Stats["Estadisticas"]
    end
```

### Modulos por Categoria

#### Principal
| Modulo      | Ruta          | Descripcion                              | Roles                              |
|-------------|---------------|------------------------------------------|------------------------------------|
| Dashboard   | `/`           | Panel principal con resumen              | Admin, Doctor, Enfermera, Recepcion|
| Citas       | `/citas`      | Gestion de citas medicas                 | Admin, Doctor, Enfermera, Recepcion|
| Calendario  | `/calendario` | Vista calendario de citas                | Admin, Doctor, Enfermera, Recepcion|
| Pacientes   | `/pacientes`  | Registro y gestion de pacientes          | Admin, Enfermera, Recepcion        |
| Doctores    | `/doctores`   | Directorio de medicos                    | Admin, Enfermera, Recepcion        |

#### Clinico
| Modulo           | Ruta                 | Descripcion                        | Roles                    |
|------------------|----------------------|------------------------------------|--------------------------|
| Historia Clinica | `/historia-clinica`  | Historiales medicos                | Admin, Doctor, Enfermera |
| Notas Medicas    | `/notas-medicas`     | Notas y observaciones              | Admin, Doctor, Enfermera |
| Prescripciones   | `/prescripciones`    | Recetas y medicamentos             | Admin, Doctor, Enfermera |
| Laboratorio      | `/laboratorio`       | Examenes de laboratorio            | Admin, Doctor, Enfermera |
| Triaje           | `/triaje`            | Evaluacion inicial                 | Admin, Doctor, Enfermera |
| Derivaciones     | `/derivaciones`      | Referencias a especialistas        | Admin, Doctor, Enfermera |

#### Administrativo
| Modulo            | Ruta                      | Descripcion                      | Roles                    |
|-------------------|---------------------------|----------------------------------|--------------------------|
| Archivos Clinicos | `/archivos-clinicos`      | Documentos medicos               | Admin, Doctor, Enfermera |
| Hospitalizacion   | `/hospitalizacion`        | Pacientes hospitalizados         | Admin, Doctor, Enfermera |
| Gestion de Camas  | `/gestion-camas`          | Administracion de camas          | Admin, Doctor, Enfermera |
| Gestion Accesos   | `/configuracion/accesos`  | Permisos de usuarios             | Admin                    |

#### Reportes
| Modulo   | Ruta        | Descripcion              | Roles         |
|----------|-------------|--------------------------|---------------|
| Reportes | `/reportes` | Estadisticas y reportes  | Admin, Doctor |

---

## Configuracion

### Configuracion de Tema

```mermaid
graph LR
    ThemeProvider["ThemeProvider"]
    ThemeProvider --> ThemeContext["Theme Context"]
    ThemeContext --> Light["Tema Claro"]
    ThemeContext --> Dark["Tema Oscuro"]
    
    ThemeContext --> AntDesign["Ant Design Theme"]
    ThemeContext --> Tailwind["Tailwind Classes"]
    ThemeContext --> CSS["CSS Variables"]
```

### Configuracion de Vite

El archivo `electron.vite.config.ts` define los alias de importacion:

```typescript
// Aliases disponibles
'@renderer' -> 'src/renderer/src'
'@main'     -> 'src/main'
'@shared'   -> 'packages/shared'
```

---

## Compilacion y Distribucion

### Proceso de Build

```mermaid
flowchart TD
    Source["Codigo Fuente"]
    Source --> TypeCheck["TypeScript Check"]
    TypeCheck --> ViteBuild["Vite Build"]
    
    ViteBuild --> MainBundle["Main Bundle"]
    ViteBuild --> PreloadBundle["Preload Bundle"]
    ViteBuild --> RendererBundle["Renderer Bundle"]
    
    MainBundle --> ElectronBuilder["Electron Builder"]
    PreloadBundle --> ElectronBuilder
    RendererBundle --> ElectronBuilder
    
    ElectronBuilder --> Windows["Windows .exe"]
    ElectronBuilder --> MacOS["macOS .dmg"]
    ElectronBuilder --> Linux["Linux .AppImage"]
```

### Generar Instaladores

Para Windows:
```bash
npm run build:win
```

Para macOS:
```bash
npm run build:mac
```

Para Linux:
```bash
npm run build:linux
```

Los instaladores se generan en la carpeta `dist/`.

---

## Licencia

Este proyecto esta bajo la Licencia MIT. Consulta el archivo LICENSE para mas detalles.

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-Electron-47848F?style=flat-square&logo=electron" alt="Made with Electron">
  <img src="https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react" alt="Made with React">
  <img src="https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat-square&logo=typescript" alt="Made with TypeScript">
</p>
