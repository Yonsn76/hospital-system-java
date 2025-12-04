import { v4 as uuid } from 'uuid'
import type { Doctor, CreateDoctorDto, UpdateDoctorDto } from '@shared/types'
import { dataStore } from './DataStore'

class DoctorService {
  create(dto: CreateDoctorDto): Doctor {
    const now = new Date().toISOString()
    const doctor: Doctor = {
      id: uuid(),
      ...dto,
      activo: true,
      createdAt: now,
      updatedAt: now
    }

    const doctores = dataStore.get('doctores')
    dataStore.set('doctores', [...doctores, doctor])
    return doctor
  }

  update(dto: UpdateDoctorDto): Doctor | null {
    const doctores = dataStore.get('doctores')
    const index = doctores.findIndex((d) => d.id === dto.id)
    if (index === -1) return null

    const updated: Doctor = {
      ...doctores[index],
      ...dto,
      updatedAt: new Date().toISOString()
    }

    doctores[index] = updated
    dataStore.set('doctores', doctores)
    return updated
  }

  delete(id: string): boolean {
    const doctores = dataStore.get('doctores')
    const filtered = doctores.filter((d) => d.id !== id)
    if (filtered.length === doctores.length) return false

    dataStore.set('doctores', filtered)
    return true
  }

  getById(id: string): Doctor | null {
    return dataStore.get('doctores').find((d) => d.id === id) || null
  }

  getAll(): Doctor[] {
    return dataStore.get('doctores')
  }

  getByEspecialidad(especialidadId: string): Doctor[] {
    return dataStore.get('doctores').filter((d) => d.especialidadId === especialidadId && d.activo)
  }
}

export const doctorService = new DoctorService()
