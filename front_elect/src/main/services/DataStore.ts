import Store from 'electron-store'
import type { Paciente, Doctor, Cita, Especialidad } from '@shared/types'

interface DataSchema {
  pacientes: Paciente[]
  doctores: Doctor[]
  citas: Cita[]
  especialidades: Especialidad[]
}

const defaultEspecialidades: Especialidad[] = [
  { id: '1', nombre: 'Medicina General', color: '#3b82f6' },
  { id: '2', nombre: 'Pediatría', color: '#22c55e' },
  { id: '3', nombre: 'Cardiología', color: '#ef4444' },
  { id: '4', nombre: 'Dermatología', color: '#f59e0b' },
  { id: '5', nombre: 'Traumatología', color: '#8b5cf6' },
  { id: '6', nombre: 'Ginecología', color: '#ec4899' },
  { id: '7', nombre: 'Oftalmología', color: '#06b6d4' },
  { id: '8', nombre: 'Neurología', color: '#6366f1' }
]

class DataStore {
  private store: Store<DataSchema> | null = null

  async init(): Promise<void> {
    this.store = new Store<DataSchema>({
      name: 'data',
      defaults: {
        pacientes: [],
        doctores: [],
        citas: [],
        especialidades: defaultEspecialidades
      }
    })
  }

  get<K extends keyof DataSchema>(key: K): DataSchema[K] {
    if (!this.store) throw new Error('DataStore not initialized')
    return this.store.get(key)
  }

  set<K extends keyof DataSchema>(key: K, value: DataSchema[K]): void {
    if (!this.store) throw new Error('DataStore not initialized')
    this.store.set(key, value)
  }
}

export const dataStore = new DataStore()
