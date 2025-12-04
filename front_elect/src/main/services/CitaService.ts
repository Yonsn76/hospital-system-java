import { v4 as uuid } from 'uuid'
import type { Cita, CreateCitaDto, UpdateCitaDto, DisponibilidadSlot } from '@shared/types'
import { dataStore } from './DataStore'
import { doctorService } from './DoctorService'

class CitaService {
  create(dto: CreateCitaDto): Cita {
    const doctor = doctorService.getById(dto.doctorId)
    if (!doctor) throw new Error('Doctor no encontrado')

    const horario = doctor.horarioAtencion.find((h) => {
      const fecha = new Date(dto.fecha)
      return h.diaSemana === fecha.getDay()
    })

    const duracion = horario?.duracionTurno || 30
    const [hora, minutos] = dto.horaInicio.split(':').map(Number)
    const horaFin = new Date(2000, 0, 1, hora, minutos + duracion)
    const horaFinStr = `${horaFin.getHours().toString().padStart(2, '0')}:${horaFin.getMinutes().toString().padStart(2, '0')}`

    const now = new Date().toISOString()
    const cita: Cita = {
      id: uuid(),
      pacienteId: dto.pacienteId,
      doctorId: dto.doctorId,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin: horaFinStr,
      estado: 'programada',
      motivo: dto.motivo,
      notas: dto.notas,
      createdAt: now,
      updatedAt: now
    }

    const citas = dataStore.get('citas')
    dataStore.set('citas', [...citas, cita])
    return cita
  }

  update(dto: UpdateCitaDto): Cita | null {
    const citas = dataStore.get('citas')
    const index = citas.findIndex((c) => c.id === dto.id)
    if (index === -1) return null

    const updated: Cita = {
      ...citas[index],
      ...dto,
      updatedAt: new Date().toISOString()
    }

    citas[index] = updated
    dataStore.set('citas', citas)
    return updated
  }

  cancel(id: string): Cita | null {
    return this.updateEstado(id, 'cancelada')
  }

  complete(id: string): Cita | null {
    return this.updateEstado(id, 'completada')
  }

  private updateEstado(id: string, estado: Cita['estado']): Cita | null {
    const citas = dataStore.get('citas')
    const index = citas.findIndex((c) => c.id === id)
    if (index === -1) return null

    citas[index] = { ...citas[index], estado, updatedAt: new Date().toISOString() }
    dataStore.set('citas', citas)
    return citas[index]
  }

  getById(id: string): Cita | null {
    return dataStore.get('citas').find((c) => c.id === id) || null
  }

  getByPaciente(pacienteId: string): Cita[] {
    return dataStore.get('citas').filter((c) => c.pacienteId === pacienteId)
  }

  getByDoctor(doctorId: string): Cita[] {
    return dataStore.get('citas').filter((c) => c.doctorId === doctorId)
  }

  getByFecha(fecha: string): Cita[] {
    return dataStore.get('citas').filter((c) => c.fecha === fecha)
  }

  getAll(): Cita[] {
    return dataStore.get('citas')
  }

  getDisponibilidad(doctorId: string, fecha: string): DisponibilidadSlot[] {
    const doctor = doctorService.getById(doctorId)
    if (!doctor) return []

    const fechaObj = new Date(fecha)
    const horario = doctor.horarioAtencion.find((h) => h.diaSemana === fechaObj.getDay())
    if (!horario) return []

    const citasDelDia = this.getByDoctor(doctorId).filter((c) => c.fecha === fecha && c.estado !== 'cancelada')

    const slots: DisponibilidadSlot[] = []
    const [horaIni] = horario.horaInicio.split(':').map(Number)
    const [horaFin] = horario.horaFin.split(':').map(Number)
    const duracion = horario.duracionTurno

    for (let h = horaIni; h < horaFin; h++) {
      for (let m = 0; m < 60; m += duracion) {
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        const ocupado = citasDelDia.some((c) => c.horaInicio === hora)
        slots.push({ hora, disponible: !ocupado })
      }
    }

    return slots
  }
}

export const citaService = new CitaService()
