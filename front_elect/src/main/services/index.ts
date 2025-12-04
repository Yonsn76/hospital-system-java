import { configManager } from './ConfigManager'
import { dataStore } from './DataStore'
import { themeService } from './ThemeService'

export async function initServices(): Promise<void> {
  await configManager.init()
  await dataStore.init()
  themeService.init()
}

export { configManager } from './ConfigManager'
export { dataStore } from './DataStore'
export { themeService } from './ThemeService'
export { pacienteService } from './PacienteService'
export { doctorService } from './DoctorService'
export { citaService } from './CitaService'
export { especialidadService } from './EspecialidadService'
