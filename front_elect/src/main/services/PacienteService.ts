import { v4 as uuid } from 'uuid'
import type { Paciente, CreatePacienteDto, UpdatePacienteDto } from '@shared/types'
import { dataStore } from './DataStore'

class PacienteService {
  create(dto: CreatePacienteDto): Paciente {
    const now = new Date().toISOString()
    const paciente: Paciente = {
      id: uuid(),
      ...dto,
      createdAt: now,
      updatedAt: now
    }

    const pacientes = dataStore.get('pacientes')
    dataStore.set('pacientes', [...pacientes, paciente])
    return paciente
  }

  update(dto: UpdatePacienteDto): Paciente | null {
    const pacientes = dataStore.get('pacientes')
    const index = pacientes.findIndex((p) => p.id === dto.id)
    if (index === -1) return null

    const updated: Paciente = {
      ...pacientes[index],
      ...dto,
      updatedAt: new Date().toISOString()
    }

    pacientes[index] = updated
    dataStore.set('pacientes', pacientes)
    return updated
  }

  delete(id: string): boolean {
    const pacientes = dataStore.get('pacientes')
    const filtered = pacientes.filter((p) => p.id !== id)
    if (filtered.length === pacientes.length) return false

    dataStore.set('pacientes', filtered)
    return true
  }

  getById(id: string): Paciente | null {
    return dataStore.get('pacientes').find((p) => p.id === id) || null
  }

  getAll(): Paciente[] {
    return dataStore.get('pacientes')
  }

  search(query: string): Paciente[] {
    const q = query.toLowerCase()
    return dataStore
      .get('pacientes')
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.apellido.toLowerCase().includes(q) ||
          p.dni.includes(q) ||
          p.email.toLowerCase().includes(q)
      )
  }
}

export const pacienteService = new PacienteService()
