import { BrowserWindow, ipcMain, Notification as ElectronNotification } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import {
  ThemeMode,
  type CreatePacienteDto,
  type UpdatePacienteDto,
  type CreateDoctorDto,
  type UpdateDoctorDto,
  type CreateCitaDto,
  type UpdateCitaDto,
  type Notification
} from '@shared/types'
import { pacienteService } from './services/PacienteService'
import { doctorService } from './services/DoctorService'
import { citaService } from './services/CitaService'
import { especialidadService } from './services/EspecialidadService'
import { configManager } from './services/ConfigManager'
import { themeService } from './services/ThemeService'
import { getDataPath } from './utils/paths'

export function registerIpc(mainWindow: BrowserWindow, app: Electron.App): void {
  // ============ APP ============
  ipcMain.handle(IpcChannel.App_Info, () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    appPath: app.getAppPath(),
    dataPath: getDataPath()
  }))

  ipcMain.handle(IpcChannel.App_Reload, () => mainWindow.reload())
  ipcMain.handle(IpcChannel.App_Quit, () => app.quit())
  ipcMain.handle(IpcChannel.App_SetTheme, (_, theme: ThemeMode) => {
    themeService.setTheme(theme)
  })

  // ============ WINDOW ============
  ipcMain.handle(IpcChannel.Window_Minimize, () => mainWindow.minimize())
  ipcMain.handle(IpcChannel.Window_Maximize, () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.handle(IpcChannel.Window_Close, () => mainWindow.close())
  ipcMain.handle(IpcChannel.Window_IsMaximized, () => mainWindow.isMaximized())

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send(IpcChannel.Window_MaximizedChanged, true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send(IpcChannel.Window_MaximizedChanged, false)
  })

  // ============ PACIENTES ============
  ipcMain.handle(IpcChannel.Paciente_Create, (_, dto: CreatePacienteDto) => pacienteService.create(dto))
  ipcMain.handle(IpcChannel.Paciente_Update, (_, dto: UpdatePacienteDto) => pacienteService.update(dto))
  ipcMain.handle(IpcChannel.Paciente_Delete, (_, id: string) => pacienteService.delete(id))
  ipcMain.handle(IpcChannel.Paciente_GetById, (_, id: string) => pacienteService.getById(id))
  ipcMain.handle(IpcChannel.Paciente_GetAll, () => pacienteService.getAll())
  ipcMain.handle(IpcChannel.Paciente_Search, (_, query: string) => pacienteService.search(query))

  // ============ DOCTORES ============
  ipcMain.handle(IpcChannel.Doctor_Create, (_, dto: CreateDoctorDto) => doctorService.create(dto))
  ipcMain.handle(IpcChannel.Doctor_Update, (_, dto: UpdateDoctorDto) => doctorService.update(dto))
  ipcMain.handle(IpcChannel.Doctor_Delete, (_, id: string) => doctorService.delete(id))
  ipcMain.handle(IpcChannel.Doctor_GetById, (_, id: string) => doctorService.getById(id))
  ipcMain.handle(IpcChannel.Doctor_GetAll, () => doctorService.getAll())
  ipcMain.handle(IpcChannel.Doctor_GetByEspecialidad, (_, id: string) => doctorService.getByEspecialidad(id))

  // ============ CITAS ============
  ipcMain.handle(IpcChannel.Cita_Create, (_, dto: CreateCitaDto) => citaService.create(dto))
  ipcMain.handle(IpcChannel.Cita_Update, (_, dto: UpdateCitaDto) => citaService.update(dto))
  ipcMain.handle(IpcChannel.Cita_Cancel, (_, id: string) => citaService.cancel(id))
  ipcMain.handle(IpcChannel.Cita_Complete, (_, id: string) => citaService.complete(id))
  ipcMain.handle(IpcChannel.Cita_GetById, (_, id: string) => citaService.getById(id))
  ipcMain.handle(IpcChannel.Cita_GetByPaciente, (_, id: string) => citaService.getByPaciente(id))
  ipcMain.handle(IpcChannel.Cita_GetByDoctor, (_, id: string) => citaService.getByDoctor(id))
  ipcMain.handle(IpcChannel.Cita_GetByFecha, (_, fecha: string) => citaService.getByFecha(fecha))
  ipcMain.handle(IpcChannel.Cita_GetAll, () => citaService.getAll())
  ipcMain.handle(IpcChannel.Cita_GetDisponibilidad, (_, doctorId: string, fecha: string) =>
    citaService.getDisponibilidad(doctorId, fecha)
  )

  // ============ ESPECIALIDADES ============
  ipcMain.handle(IpcChannel.Especialidad_GetAll, () => especialidadService.getAll())

  // ============ CONFIG ============
  ipcMain.handle(IpcChannel.Config_Set, (_, key: string, value: unknown) => {
    configManager.set(key as 'theme' | 'language' | 'backupPath', value as never)
  })
  ipcMain.handle(IpcChannel.Config_Get, (_, key: string) => {
    return configManager.get(key as 'theme' | 'language' | 'backupPath')
  })

  // ============ NOTIFICATIONS ============
  ipcMain.handle(IpcChannel.Notification_Send, (_, notification: Notification) => {
    const notif = new ElectronNotification({
      title: notification.title,
      body: notification.message
    })
    notif.show()
  })
}
