# Diagramas - Sistema Hospitalario

<p align="center">
  <img src="https://img.shields.io/badge/Mermaid-Diagrams-ff69b4?style=for-the-badge&logo=mermaid" alt="Mermaid"/>
  <img src="https://img.shields.io/badge/UML-Documentation-blue?style=for-the-badge" alt="UML"/>
</p>

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Diagramas Disponibles](#diagramas-disponibles)
- [Como Visualizar](#como-visualizar)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Modelo de Datos](#modelo-de-datos)
- [Flujo de Autenticacion](#flujo-de-autenticacion)

---

## Descripcion

Esta carpeta contiene los diagramas de documentacion tecnica del sistema hospitalario. Todos los diagramas estan escritos en formato Mermaid, lo que permite visualizarlos directamente en GitHub, GitLab o cualquier visor compatible.

---

## Diagramas Disponibles

| Archivo | Tipo | Descripcion |
|---------|------|-------------|
| `architecture.md` | Diagrama de Componentes | Arquitectura general del sistema |
| `er_diagram.md` | Diagrama ER | Modelo de base de datos |
| `sequence_auth.md` | Diagrama de Secuencia | Flujo de autenticacion |

---

## Como Visualizar

### Opcion 1: GitHub/GitLab

Los archivos `.md` con bloques Mermaid se renderizan automaticamente en GitHub y GitLab.

### Opcion 2: VS Code

Instalar la extension "Markdown Preview Mermaid Support":

1. Abrir VS Code
2. Ir a Extensions (Ctrl+Shift+X)
3. Buscar "Markdown Preview Mermaid Support"
4. Instalar y reiniciar

### Opcion 3: Mermaid Live Editor

1. Ir a https://mermaid.live
2. Copiar el contenido del bloque ```mermaid```
3. Pegar en el editor

### Opcion 4: CLI

```bash
# Instalar mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Generar imagen PNG
mmdc -i architecture.md -o architecture.png

# Generar imagen SVG
mmdc -i architecture.md -o architecture.svg
```

---

## Arquitectura del Sistema

**Archivo**: `architecture.md`

Muestra la arquitectura de alto nivel del sistema:

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|   Web Browser     |---->|   Angular App     |---->|  Spring Boot API  |
|                   |     |   (Frontend)      |     |   (Backend)       |
|                   |     |                   |     |                   |
+-------------------+     +-------------------+     +--------+----------+
                                                             |
                                                             v
                                                    +-------------------+
                                                    |                   |
                                                    |   PostgreSQL DB   |
                                                    |                   |
                                                    +-------------------+
```

### Capas del Sistema

| Capa | Tecnologia | Responsabilidad |
|------|------------|-----------------|
| **Presentacion** | Angular 17 | Interfaz de usuario |
| **API** | Spring Boot | Logica de negocio y REST endpoints |
| **Seguridad** | Spring Security + JWT | Autenticacion y autorizacion |
| **Persistencia** | JPA/Hibernate | Acceso a datos |
| **Base de Datos** | PostgreSQL | Almacenamiento |

---

## Modelo de Datos

**Archivo**: `er_diagram.md`

### Entidades Principales

| Entidad | Descripcion | Relaciones |
|---------|-------------|------------|
| **USERS** | Usuarios del sistema | 1:1 con DOCTORS |
| **DOCTORS** | Informacion de medicos | N:M con APPOINTMENTS, 1:N con MEDICAL_RECORDS |
| **PATIENTS** | Datos de pacientes | 1:N con APPOINTMENTS, 1:N con MEDICAL_RECORDS |
| **APPOINTMENTS** | Citas medicas | N:1 con PATIENTS, N:1 con DOCTORS |
| **MEDICAL_RECORDS** | Historial medico | N:1 con PATIENTS, N:1 con DOCTORS |
| **RESOURCES** | Recursos hospitalarios | Independiente |

### Cardinalidades

```
USERS ----||--o| DOCTORS        (Un usuario puede ser un doctor)
PATIENTS ----||--o{ APPOINTMENTS (Un paciente tiene muchas citas)
DOCTORS ----||--o{ APPOINTMENTS  (Un doctor atiende muchas citas)
PATIENTS ----||--o{ MEDICAL_RECORDS (Un paciente tiene muchos registros)
DOCTORS ----||--o{ MEDICAL_RECORDS  (Un doctor crea muchos registros)
```

---

## Flujo de Autenticacion

**Archivo**: `sequence_auth.md`

### Proceso de Login

1. Usuario ingresa credenciales en el formulario
2. Angular envia POST a `/api/auth/login`
3. Backend valida credenciales contra la base de datos
4. Si son validas, genera token JWT con el rol del usuario
5. Frontend almacena el token en LocalStorage
6. Usuario es redirigido al Dashboard

### Proceso de Peticiones Autenticadas

1. Interceptor de Angular agrega header `Authorization: Bearer <token>`
2. JwtAuthenticationFilter valida el token
3. Extrae el rol del usuario del token
4. SecurityConfig verifica permisos con @PreAuthorize
5. Si tiene permisos, procesa la peticion
6. Si no tiene permisos, retorna 403 Forbidden

### Estados de Error

| Codigo | Situacion | Accion del Frontend |
|--------|-----------|---------------------|
| 401 | Token invalido/expirado | Redirigir a login |
| 403 | Sin permisos | Mostrar mensaje de error |
| 404 | Recurso no encontrado | Mostrar pagina 404 |

---

## Convenciones de Diagramas

### Colores por Tipo

| Elemento | Color | Uso |
|----------|-------|-----|
| Componentes Frontend | Azul | Angular, componentes UI |
| Componentes Backend | Verde | Spring Boot, servicios |
| Base de Datos | Naranja | PostgreSQL, entidades |
| Seguridad | Rojo | JWT, autenticacion |

### Nomenclatura

- **PascalCase**: Nombres de entidades y componentes
- **camelCase**: Metodos y propiedades
- **UPPER_CASE**: Constantes y enums

---

## Agregar Nuevos Diagramas

Para agregar un nuevo diagrama:

1. Crear archivo `.md` en esta carpeta
2. Usar sintaxis Mermaid dentro de bloques de codigo
3. Documentar el proposito del diagrama
4. Actualizar este README con la referencia

### Plantilla

```markdown
# Nombre del Diagrama

## Descripcion

Breve descripcion del diagrama.

## Diagrama

\`\`\`mermaid
graph TD
    A[Inicio] --> B[Proceso]
    B --> C[Fin]
\`\`\`

## Notas

Notas adicionales sobre el diagrama.
```

---

## Referencias

- [Documentacion de Mermaid](https://mermaid.js.org/intro/)
- [Sintaxis de Diagramas ER](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)
- [Sintaxis de Diagramas de Secuencia](https://mermaid.js.org/syntax/sequenceDiagram.html)
- [Sintaxis de Flowcharts](https://mermaid.js.org/syntax/flowchart.html)
