# 🏥 Citas Médicas

Sistema de gestión de citas médicas desarrollado con Electron + React + TypeScript.

## 📋 Características

- ✅ Gestión de pacientes (CRUD completo)
- ✅ Gestión de doctores y especialidades
- ✅ Programación de citas con disponibilidad en tiempo real
- ✅ Calendario visual de citas
- ✅ Dashboard con estadísticas
- ✅ Tema claro/oscuro
- ✅ Persistencia local de datos

## 🛠️ Stack Tecnológico

| Capa      | Tecnología                                   |
| --------- | -------------------------------------------- |
| Framework | Electron + Vite                              |
| Frontend  | React 19 + TypeScript                        |
| Estado    | Redux Toolkit + Redux Persist                |
| UI        | Ant Design + Styled Components + TailwindCSS |
| Testing   | Vitest                                       |

## 📁 Estructura del Proyecto

```
citas-medic/
├── packages/
│   └── shared/           # Tipos y canales IPC compartidos
├── src/
│   ├── main/             # Proceso principal (Node.js)
│   │   ├── services/     # Servicios de negocio
│   │   ├── utils/        # Utilidades
│   │   ├── index.ts      # Entry point
│   │   └── ipc.ts        # Handlers IPC
│   ├── preload/          # Bridge seguro Main <-> Renderer
│   └── renderer/         # Interfaz de usuario (React)
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── store/
│           └── styles/
```

## 🚀 Instalación

```bash
# Instalar dependencias
yarn install

# Desarrollo
yarn dev

# Build
yarn build

# Build para Windows
yarn build:win

# Build para macOS
yarn build:mac

# Build para Linux
yarn build:linux
```

## 📝 Scripts Disponibles

| Script             | Descripción               |
| ------------------ | ------------------------- |
| `yarn dev`         | Inicia en modo desarrollo |
| `yarn build`       | Compila el proyecto       |
| `yarn build:win`   | Build para Windows        |
| `yarn build:mac`   | Build para macOS          |
| `yarn build:linux` | Build para Linux          |
| `yarn lint`        | Ejecuta ESLint            |
| `yarn test`        | Ejecuta tests             |
| `yarn typecheck`   | Verifica tipos TypeScript |

## 🏗️ Arquitectura

### Comunicación IPC

```
Renderer (React) → Preload (Bridge) → Main (Node.js)
     ↑                                      ↓
     └──────────── Response ────────────────┘
```

### Flujo de datos

1. El usuario interactúa con la UI (Renderer)
2. Se llama a `window.api.xxx()` (expuesto por Preload)
3. El Preload envía el mensaje via `ipcRenderer.invoke()`
4. El Main procesa la solicitud en el servicio correspondiente
5. El resultado se devuelve al Renderer

## 📄 Licencia

MIT
