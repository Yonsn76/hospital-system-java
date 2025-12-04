import type { Especialidad } from '@shared/types'
import { dataStore } from './DataStore'

class EspecialidadService {
  getAll(): Especialidad[] {
    return dataStore.get('especialidades')
  }

  getById(id: string): Especialidad | null {
    return dataStore.get('especialidades').find((e) => e.id === id) || null
  }
}

export const especialidadService = new EspecialidadService()
