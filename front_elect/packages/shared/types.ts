// ============ ENTIDADES BASE ============

export interface Paciente {
  id: string
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  fechaNacimiento: string
  direccion?: string
  obraSocial?: string
  numeroAfiliado?: string
  notas?: string
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  id: string
  nombre: string
  apellido: string
  especialidadId: string
  matricula: string
  email: string
  telefono: string
  horarioAtencion: HorarioAtencion[]
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface HorarioAtencion {
  diaSemana: number // 0-6 (Domingo-Sábado)
  horaInicio: string // "09:00"
  horaFin: string // "18:00"
  duracionTurno: number // minutos
}

export interface Especialidad {
  id: string
  nombre: string
  descripcion?: string
  color: string
}

export interface Cita {
  id: string
  pacienteId: string
  doctorId: string
  fecha: string // ISO date
  horaInicio: string
  horaFin: string
  estado: EstadoCita
  motivo: string
  notas?: string
  createdAt: string
  updatedAt: string
}

export type EstadoCita = 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio'

// ============ DTOs ============

export interface CreatePacienteDto {
  nombre: string
  apellido: string
  dni: string
  email: string
  telefono: string
  fechaNacimiento: string
  direccion?: string
  obraSocial?: string
  numeroAfiliado?: string
  notas?: string
}

export interface UpdatePacienteDto extends Partial<CreatePacienteDto> {
  id: string
}

export interface CreateDoctorDto {
  nombre: string
  apellido: string
  especialidadId: string
  matricula: string
  email: string
  telefono: string
  horarioAtencion: HorarioAtencion[]
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {
  id: string
  activo?: boolean
}

export interface CreateCitaDto {
  pacienteId: string
  doctorId: string
  fecha: string
  horaInicio: string
  motivo: string
  notas?: string
}

export interface UpdateCitaDto {
  id: string
  fecha?: string
  horaInicio?: string
  motivo?: string
  notas?: string
}

// ============ VISTAS ============

export interface CitaConDetalles extends Cita {
  paciente: Paciente
  doctor: Doctor
  especialidad: Especialidad
}

export interface DisponibilidadSlot {
  hora: string
  disponible: boolean
}

// ============ APP ============

export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  system = 'system'
}

export interface AppInfo {
  version: string
  isPackaged: boolean
  appPath: string
  dataPath: string
}

export interface Notification {
  id?: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
}
