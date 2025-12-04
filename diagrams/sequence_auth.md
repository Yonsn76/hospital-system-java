# Flujo de Autenticacion

<p align="center">
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Spring%20Security-6.x-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Spring Security"/>
</p>

---

## Diagrama de Secuencia - Login

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuario
    participant React as React App
    participant Redux as Redux Store
    participant API as API Service
    participant Auth as AuthController
    participant Service as AuthService
    participant JWT as JwtUtil
    participant DB as PostgreSQL

    User->>React: Ingresa credenciales
    React->>API: login(username, password)
    API->>Auth: POST /api/auth/login
    Auth->>Service: authenticate(request)
    Service->>DB: findByUsername(username)
    DB-->>Service: User entity
    
    alt Credenciales Invalidas
        Service-->>Auth: throw BadCredentialsException
        Auth-->>API: 401 Unauthorized
        API-->>React: Error response
        React-->>User: Mostrar mensaje de error
    else Credenciales Validas
        Service->>Service: passwordEncoder.matches()
        Service->>JWT: generateToken(user)
        JWT-->>Service: JWT Token (24h)
        Service-->>Auth: AuthResponse(token, user, role)
        Auth-->>API: 200 OK + JSON
        API->>Redux: dispatch(loginSuccess)
        Redux->>Redux: Persist token (localStorage)
        React-->>User: Redirect to Dashboard
    end
```

---

## Diagrama de Secuencia - Peticion Autenticada

```mermaid
sequenceDiagram
    autonumber
    participant React as React App
    participant Query as React Query
    participant API as API Service
    participant Filter as JwtAuthFilter
    participant JWT as JwtUtil
    participant Security as SecurityContext
    participant Controller as Controller
    participant Service as Service
    participant DB as PostgreSQL

    React->>Query: useQuery('patients')
    Query->>API: getPatients()
    API->>API: Add Authorization header
    API->>Filter: GET /api/patients<br/>Authorization: Bearer <token>
    Filter->>Filter: Extract token from header
    Filter->>JWT: validateToken(token)
    
    alt Token Invalido o Expirado
        JWT-->>Filter: false
        Filter-->>API: 401 Unauthorized
        API->>React: Dispatch logout event
        React->>React: Redirect to /login
    else Token Valido
        JWT->>JWT: extractUsername(token)
        JWT->>JWT: extractRole(token)
        JWT-->>Filter: UserDetails
        Filter->>Security: setAuthentication(auth)
        Filter->>Controller: Continue request
        Controller->>Controller: @PreAuthorize check
        
        alt Sin Permisos
            Controller-->>API: 403 Forbidden
            API-->>Query: Error
            Query-->>React: Show error message
        else Con Permisos
            Controller->>Service: getAllPatients()
            Service->>DB: findAll()
            DB-->>Service: List<Patient>
            Service-->>Controller: List<PatientDTO>
            Controller-->>API: 200 OK + JSON
            API-->>Query: Data
            Query->>Query: Cache response
            Query-->>React: Render data
        end
    end
```

---

## Diagrama de Secuencia - Registro de Usuario

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Administrador
    participant React as React App
    participant API as API Service
    participant Auth as AuthController
    participant Service as AuthService
    participant Encoder as PasswordEncoder
    participant DB as PostgreSQL

    Admin->>React: Completa formulario de registro
    React->>React: Validar campos
    React->>API: register(userData)
    API->>Auth: POST /api/auth/register
    Auth->>Service: register(request)
    
    Service->>DB: existsByUsername(username)
    DB-->>Service: boolean
    
    alt Usuario ya existe
        Service-->>Auth: throw UserAlreadyExistsException
        Auth-->>API: 409 Conflict
        API-->>React: Error response
        React-->>Admin: Mostrar "Usuario ya existe"
    else Usuario disponible
        Service->>Encoder: encode(password)
        Encoder-->>Service: hashedPassword
        Service->>Service: Create User entity
        Service->>DB: save(user)
        DB-->>Service: User (with ID)
        Service-->>Auth: UserResponse
        Auth-->>API: 201 Created
        API-->>React: Success response
        React-->>Admin: Mostrar "Usuario creado"
    end
```

---

## Diagrama de Secuencia - Refresh Token (Opcional)

```mermaid
sequenceDiagram
    autonumber
    participant React as React App
    participant Interceptor as HTTP Interceptor
    participant API as API Service
    participant Auth as AuthController
    participant JWT as JwtUtil
    participant Redux as Redux Store

    React->>API: Request con token expirado
    API->>Interceptor: Interceptar respuesta
    Interceptor->>Interceptor: Detectar 401
    
    alt Token puede renovarse
        Interceptor->>Auth: POST /api/auth/refresh
        Auth->>JWT: refreshToken(oldToken)
        JWT-->>Auth: newToken
        Auth-->>Interceptor: 200 OK + newToken
        Interceptor->>Redux: updateToken(newToken)
        Interceptor->>API: Reintentar request original
        API-->>React: Response exitosa
    else Token no renovable
        Interceptor->>Redux: dispatch(logout)
        Redux->>Redux: Clear persisted state
        React->>React: Redirect to /login
    end
```

---

## Estructura del Token JWT

```
Header.Payload.Signature
```

### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload

```json
{
  "sub": "username",
  "role": "DOCTOR",
  "userId": 123,
  "iat": 1701619200,
  "exp": 1701705600
}
```

### Claims Utilizados

| Claim | Descripcion |
|-------|-------------|
| sub | Username del usuario |
| role | Rol del usuario (ADMIN, DOCTOR, NURSE, etc.) |
| userId | ID del usuario en la base de datos |
| iat | Timestamp de emision |
| exp | Timestamp de expiracion (24 horas) |

---

## Configuracion de Seguridad

### Endpoints Publicos

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| /api/auth/login | POST | Iniciar sesion |
| /api/auth/register | POST | Registrar usuario |

### Endpoints Protegidos por Rol

| Endpoint | Roles Permitidos |
|----------|------------------|
| /api/patients/** | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| /api/appointments/** | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| /api/triage/** | ADMIN, DOCTOR, NURSE |
| /api/prescriptions/** | ADMIN, DOCTOR |
| /api/lab-exams/** | ADMIN, DOCTOR, NURSE, LAB_TECH |
| /api/medical-notes/** | ADMIN, DOCTOR |
| /api/reports/** | ADMIN, DOCTOR |
| /api/users/** | ADMIN |
| /api/permissions/** | ADMIN |

---

## Manejo de Errores de Autenticacion

| Codigo | Error | Causa | Accion del Cliente |
|--------|-------|-------|-------------------|
| 401 | Unauthorized | Token invalido, expirado o ausente | Redirigir a login |
| 403 | Forbidden | Usuario sin permisos para el recurso | Mostrar mensaje de acceso denegado |
| 409 | Conflict | Usuario ya existe (registro) | Mostrar mensaje de error |

---

## Flujo de Logout

```mermaid
sequenceDiagram
    autonumber
    participant User as Usuario
    participant React as React App
    participant Redux as Redux Store
    participant Storage as LocalStorage

    User->>React: Click en "Cerrar Sesion"
    React->>Redux: dispatch(logout())
    Redux->>Redux: Clear auth state
    Redux->>Storage: Remove persisted token
    React->>React: Navigate to /login
    React-->>User: Mostrar pantalla de login
```

---

## Notas de Seguridad

| Aspecto | Implementacion |
|---------|----------------|
| Almacenamiento de Token | Redux Persist con localStorage |
| Expiracion | 24 horas (configurable) |
| Algoritmo | HS256 (HMAC-SHA256) |
| Secret Key | Minimo 256 bits, variable de entorno |
| Password Hashing | BCrypt con salt |
| CORS | Configurado para origenes permitidos |
| HTTPS | Requerido en produccion |
