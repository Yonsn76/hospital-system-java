# Arquitectura del Sistema

<p align="center">
  <img src="https://img.shields.io/badge/Electron-31.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
</p>

---

## Diagrama de Arquitectura General

```mermaid
graph TD
    subgraph Desktop ["Aplicacion Desktop (Electron)"]
        Main["Proceso Main<br/>(Node.js)"]
        Preload["Preload Script<br/>(Bridge IPC)"]
        Renderer["Proceso Renderer<br/>(React + TypeScript)"]
    end

    subgraph Frontend ["Capa de Presentacion"]
        Redux["Redux Toolkit<br/>(Estado Global)"]
        ReactQuery["React Query<br/>(Server State)"]
        AntDesign["Ant Design<br/>(Componentes UI)"]
        Tailwind["TailwindCSS<br/>(Estilos)"]
    end

    subgraph Backend ["Capa de Negocio (Spring Boot)"]
        Controllers["Controllers<br/>(REST API)"]
        Security["Spring Security<br/>(JWT Filter)"]
        Services["Services<br/>(Logica de Negocio)"]
        Repositories["Repositories<br/>(JPA/Hibernate)"]
    end

    subgraph Database ["Capa de Datos"]
        PostgreSQL[("PostgreSQL<br/>hospital_db")]
    end

    Main <-->|IPC| Preload
    Preload <-->|contextBridge| Renderer
    Renderer --> Redux
    Renderer --> ReactQuery
    Renderer --> AntDesign
    Renderer --> Tailwind
    
    ReactQuery -->|HTTP/REST| Controllers
    Controllers --> Security
    Security --> Services
    Services --> Repositories
    Repositories -->|JDBC| PostgreSQL
```

---

## Arquitectura de Electron

```mermaid
graph TB
    subgraph ElectronApp ["Aplicacion Electron"]
        subgraph MainProcess ["Proceso Main (Node.js)"]
            BrowserWindow["BrowserWindow"]
            IpcMain["ipcMain Handlers"]
            LocalServices["Servicios Locales"]
            ElectronStore["Electron Store"]
        end

        subgraph PreloadProcess ["Proceso Preload"]
            ContextBridge["contextBridge"]
            IpcRenderer["ipcRenderer"]
        end

        subgraph RendererProcess ["Proceso Renderer (Chromium)"]
            ReactApp["React Application"]
            WindowAPI["window.api"]
        end
    end

    BrowserWindow -->|carga| RendererProcess
    IpcMain <-->|invoke/handle| IpcRenderer
    ContextBridge -->|exposeInMainWorld| WindowAPI
    ReactApp -->|usa| WindowAPI
    LocalServices --> ElectronStore
```

---

## Flujo de Datos

```mermaid
flowchart LR
    subgraph UI ["Interfaz de Usuario"]
        User((Usuario))
        Component["Componente React"]
    end

    subgraph State ["Gestion de Estado"]
        Redux["Redux Store"]
        Query["React Query Cache"]
    end

    subgraph API ["Capa API"]
        Service["API Service"]
        HTTP["HTTP Client"]
    end

    subgraph Server ["Servidor"]
        REST["REST Controller"]
        Business["Service Layer"]
        Data["Repository"]
    end

    subgraph DB ["Base de Datos"]
        PostgreSQL[("PostgreSQL")]
    end

    User -->|interactua| Component
    Component -->|dispatch| Redux
    Component -->|useQuery| Query
    Query -->|fetch| Service
    Service -->|request| HTTP
    HTTP -->|HTTP/JSON| REST
    REST -->|valida| Business
    Business -->|CRUD| Data
    Data -->|SQL| PostgreSQL
    PostgreSQL -->|result| Data
    Data -->|entity| Business
    Business -->|DTO| REST
    REST -->|JSON| HTTP
    HTTP -->|response| Service
    Service -->|data| Query
    Query -->|update| Component
    Redux -->|state| Component
```

---

## Arquitectura de Seguridad

```mermaid
graph TD
    subgraph Client ["Cliente (Electron)"]
        Login["Pantalla Login"]
        Token["Token Storage<br/>(Redux Persist)"]
        Interceptor["HTTP Interceptor"]
    end

    subgraph Server ["Servidor (Spring Boot)"]
        AuthController["AuthController"]
        JwtFilter["JwtAuthenticationFilter"]
        SecurityConfig["SecurityConfig"]
        AuthService["AuthService"]
        JwtUtil["JwtUtil"]
    end

    subgraph DB ["Base de Datos"]
        Users[("users")]
    end

    Login -->|POST /auth/login| AuthController
    AuthController --> AuthService
    AuthService -->|findByUsername| Users
    AuthService --> JwtUtil
    JwtUtil -->|generateToken| AuthController
    AuthController -->|JWT Token| Token
    
    Token --> Interceptor
    Interceptor -->|Authorization: Bearer| JwtFilter
    JwtFilter --> JwtUtil
    JwtUtil -->|validateToken| SecurityConfig
    SecurityConfig -->|@PreAuthorize| AuthService
```

---

## Capas del Sistema

| Capa | Tecnologia | Responsabilidad |
|------|------------|-----------------|
| Presentacion | Electron + React 18 + TypeScript | Interfaz de usuario multiplataforma |
| Estado | Redux Toolkit + React Query | Gestion de estado local y servidor |
| Comunicacion | Axios + IPC | Peticiones HTTP y comunicacion entre procesos |
| API | Spring Boot 3.2 | Endpoints REST y logica de negocio |
| Seguridad | Spring Security + JWT | Autenticacion y autorizacion |
| Persistencia | Spring Data JPA | Acceso a datos con Hibernate |
| Base de Datos | PostgreSQL 15 | Almacenamiento relacional |

---

## Puertos y Servicios

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| Backend API | 2026 | Spring Boot REST API |
| PostgreSQL | 5432 | Base de datos |
| Electron Dev | 5173 | Vite dev server (desarrollo) |

---

## Dependencias entre Modulos

```mermaid
graph BT
    subgraph Frontend ["Frontend (Electron)"]
        Pages["Pages"]
        Components["Components"]
        Hooks["Hooks"]
        Services["Services"]
        Store["Store"]
    end

    subgraph Backend ["Backend (Spring Boot)"]
        Controllers["Controllers"]
        ServicesB["Services"]
        Repositories["Repositories"]
        Models["Models/Entities"]
        DTOs["DTOs"]
    end

    Pages --> Components
    Pages --> Hooks
    Pages --> Store
    Components --> Hooks
    Hooks --> Services
    Services --> Store

    Controllers --> ServicesB
    Controllers --> DTOs
    ServicesB --> Repositories
    ServicesB --> DTOs
    Repositories --> Models
    DTOs --> Models
```
