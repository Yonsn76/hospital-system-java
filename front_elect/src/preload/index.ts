import { contextBridge, ipcRenderer, webFrame } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import type {
  CreatePacienteDto,
  UpdatePacienteDto,
  CreateDoctorDto,
  UpdateDoctorDto,
  CreateCitaDto,
  UpdateCitaDto,
  ThemeMode,
  Notification,
  Paciente,
  Doctor,
  Cita,
  Especialidad,
  DisponibilidadSlot,
  AppInfo
} from '@shared/types'

const api = {
  // App
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IpcChannel.App_Info),
  reload: () => ipcRenderer.invoke(IpcChannel.App_Reload),
  quit: () => ipcRenderer.invoke(IpcChannel.App_Quit),
  setTheme: (theme: ThemeMode) => ipcRenderer.invoke(IpcChannel.App_SetTheme, theme),

  // Window
  window: {
    minimize: () => ipcRenderer.invoke(IpcChannel.Window_Minimize),
    maximize: () => ipcRenderer.invoke(IpcChannel.Window_Maximize),
    close: () => ipcRenderer.invoke(IpcChannel.Window_Close),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IpcChannel.Window_IsMaximized),
    onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
      const listener = (_: Electron.IpcRendererEvent, value: boolean) => callback(value)
      ipcRenderer.on(IpcChannel.Window_MaximizedChanged, listener)
      return () => ipcRenderer.off(IpcChannel.Window_MaximizedChanged, listener)
    }
  },

  // Pacientes
  pacientes: {
    create: (dto: CreatePacienteDto): Promise<Paciente> => ipcRenderer.invoke(IpcChannel.Paciente_Create, dto),
    update: (dto: UpdatePacienteDto): Promise<Paciente | null> => ipcRenderer.invoke(IpcChannel.Paciente_Update, dto),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke(IpcChannel.Paciente_Delete, id),
    getById: (id: string): Promise<Paciente | null> => ipcRenderer.invoke(IpcChannel.Paciente_GetById, id),
    getAll: (): Promise<Paciente[]> => ipcRenderer.invoke(IpcChannel.Paciente_GetAll),
    search: (query: string): Promise<Paciente[]> => ipcRenderer.invoke(IpcChannel.Paciente_Search, query)
  },

  // Doctores
  doctores: {
    create: (dto: CreateDoctorDto): Promise<Doctor> => ipcRenderer.invoke(IpcChannel.Doctor_Create, dto),
    update: (dto: UpdateDoctorDto): Promise<Doctor | null> => ipcRenderer.invoke(IpcChannel.Doctor_Update, dto),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke(IpcChannel.Doctor_Delete, id),
    getById: (id: string): Promise<Doctor | null> => ipcRenderer.invoke(IpcChannel.Doctor_GetById, id),
    getAll: (): Promise<Doctor[]> => ipcRenderer.invoke(IpcChannel.Doctor_GetAll),
    getByEspecialidad: (id: string): Promise<Doctor[]> => ipcRenderer.invoke(IpcChannel.Doctor_GetByEspecialidad, id)
  },

  // Citas
  citas: {
    create: (dto: CreateCitaDto): Promise<Cita> => ipcRenderer.invoke(IpcChannel.Cita_Create, dto),
    update: (dto: UpdateCitaDto): Promise<Cita | null> => ipcRenderer.invoke(IpcChannel.Cita_Update, dto),
    cancel: (id: string): Promise<Cita | null> => ipcRenderer.invoke(IpcChannel.Cita_Cancel, id),
    complete: (id: string): Promise<Cita | null> => ipcRenderer.invoke(IpcChannel.Cita_Complete, id),
    getById: (id: string): Promise<Cita | null> => ipcRenderer.invoke(IpcChannel.Cita_GetById, id),
    getByPaciente: (id: string): Promise<Cita[]> => ipcRenderer.invoke(IpcChannel.Cita_GetByPaciente, id),
    getByDoctor: (id: string): Promise<Cita[]> => ipcRenderer.invoke(IpcChannel.Cita_GetByDoctor, id),
    getByFecha: (fecha: string): Promise<Cita[]> => ipcRenderer.invoke(IpcChannel.Cita_GetByFecha, fecha),
    getAll: (): Promise<Cita[]> => ipcRenderer.invoke(IpcChannel.Cita_GetAll),
    getDisponibilidad: (doctorId: string, fecha: string): Promise<DisponibilidadSlot[]> =>
      ipcRenderer.invoke(IpcChannel.Cita_GetDisponibilidad, doctorId, fecha)
  },

  // Especialidades
  especialidades: {
    getAll: (): Promise<Especialidad[]> => ipcRenderer.invoke(IpcChannel.Especialidad_GetAll)
  },

  // Config
  config: {
    set: (key: string, value: unknown) => ipcRenderer.invoke(IpcChannel.Config_Set, key, value),
    get: <T>(key: string): Promise<T> => ipcRenderer.invoke(IpcChannel.Config_Get, key)
  },

  // Notifications
  notification: {
    send: (notification: Notification) => ipcRenderer.invoke(IpcChannel.Notification_Send, notification)
  },

  // Zoom
  zoom: {
    reset: () => webFrame.setZoomFactor(1),
    get: () => webFrame.getZoomFactor(),
    set: (factor: number) => webFrame.setZoomFactor(factor)
  }
}

// Electron IPC para eventos
const electron = {
  ipcRenderer: {
    on: (channel: string, callback: (...args: unknown[]) => void) => {
      ipcRenderer.on(channel, callback)
    },
    removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
      ipcRenderer.removeListener(channel, callback)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
contextBridge.exposeInMainWorld('electron', electron)

export type ApiType = typeof api
export type ElectronType = typeof electron
