import type { UserRole } from '../services/api'

export interface ModuleConfig {
  id: string
  path: string
  name: string
  icon: string
  description: string
  color: string
  roles: UserRole[]
  category: 'principal' | 'clinico' | 'administrativo' | 'reportes'
}

export const ALL_MODULES: ModuleConfig[] = [
  // Principal
  {
    id: 'dashboard',
    path: '/',
    name: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'Panel principal con resumen de actividades',
    color: 'linear-gradient(135deg, #22c55e, #16a34a)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    category: 'principal'
  },
  {
    id: 'citas',
    path: '/citas',
    name: 'Citas',
    icon: 'Clock',
    description: 'Gestión de citas médicas',
    color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    category: 'principal'
  },
  {
    id: 'calendario',
    path: '/calendario',
    name: 'Calendario',
    icon: 'Calendar',
    description: 'Vista de calendario de citas',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
    category: 'principal'
  },
  {
    id: 'pacientes',
    path: '/pacientes',
    name: 'Pacientes',
    icon: 'Users',
    description: 'Registro y gestión de pacientes',
    color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    roles: ['ADMIN', 'NURSE', 'RECEPTIONIST'],
    category: 'principal'
  },
  {
    id: 'doctores',
    path: '/doctores',
    name: 'Doctores',
    icon: 'Stethoscope',
    description: 'Directorio de médicos',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    roles: ['ADMIN', 'NURSE', 'RECEPTIONIST'],
    category: 'principal'
  },

  // Clínico
  {
    id: 'historia-clinica',
    path: '/historia-clinica',
    name: 'Historia Clínica',
    icon: 'FileText',
    description: 'Historiales médicos de pacientes',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'clinico'
  },
  {
    id: 'notas-medicas',
    path: '/notas-medicas',
    name: 'Notas Médicas',
    icon: 'ClipboardList',
    description: 'Notas y observaciones médicas',
    color: 'linear-gradient(135deg, #ec4899, #db2777)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'clinico'
  },
  {
    id: 'prescripciones',
    path: '/prescripciones',
    name: 'Prescripciones',
    icon: 'Pill',
    description: 'Recetas y medicamentos',
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'clinico'
  },
  {
    id: 'laboratorio',
    path: '/laboratorio',
    name: 'Laboratorio',
    icon: 'FlaskConical',
    description: 'Exámenes de laboratorio',
    color: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'clinico'
  },
  {
    id: 'triaje',
    path: '/triaje',
    name: 'Triaje',
    icon: 'HeartPulse',
    description: 'Evaluación inicial de pacientes',
    color: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'clinico'
  },
  {
    id: 'derivaciones',
    path: '/derivaciones',
    name: 'Derivaciones',
    icon: 'Send',
    description: 'Referencias a especialistas',
    color: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'clinico'
  },

  // Administrativo
  {
    id: 'archivos-clinicos',
    path: '/archivos-clinicos',
    name: 'Archivos Clínicos',
    icon: 'FolderOpen',
    description: 'Documentos y archivos médicos',
    color: 'linear-gradient(135deg, #84cc16, #65a30d)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'administrativo'
  },
  {
    id: 'hospitalizacion',
    path: '/hospitalizacion',
    name: 'Hospitalización',
    icon: 'Building2',
    description: 'Gestión de pacientes hospitalizados',
    color: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'administrativo'
  },
  {
    id: 'gestion-camas',
    path: '/gestion-camas',
    name: 'Gestión de Camas',
    icon: 'BedDouble',
    description: 'Administración de camas hospitalarias',
    color: 'linear-gradient(135deg, #a855f7, #9333ea)',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
    category: 'administrativo'
  },

  // Reportes
  {
    id: 'reportes',
    path: '/reportes',
    name: 'Reportes',
    icon: 'BarChart3',
    description: 'Estadísticas y reportes',
    color: 'linear-gradient(135deg, #64748b, #475569)',
    roles: ['ADMIN', 'DOCTOR'],
    category: 'reportes'
  },

  // Administración (solo ADMIN)
  {
    id: 'gestion-accesos',
    path: '/configuracion/accesos',
    name: 'Gestión de Accesos',
    icon: 'Shield',
    description: 'Configurar permisos de usuarios y roles',
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    roles: ['ADMIN'],
    category: 'administrativo'
  }
]

// Función base que obtiene módulos por rol (sin permisos personalizados)
export const getDefaultModulesByRole = (role: UserRole): ModuleConfig[] => {
  return ALL_MODULES.filter((module) => module.roles.includes(role))
}

// Función que obtiene módulos considerando permisos personalizados de rol
export const getModulesByRole = (
  role: UserRole,
  customPermissions?: { additionalModules: string[]; removedModules: string[] }
): ModuleConfig[] => {
  const defaultModules = ALL_MODULES.filter((module) => module.roles.includes(role))

  if (!customPermissions) {
    return defaultModules
  }

  // Filtrar módulos removidos
  let modules = defaultModules.filter(
    (module) => !customPermissions.removedModules.includes(module.id)
  )

  // Agregar módulos adicionales
  const additionalModules = ALL_MODULES.filter(
    (module) =>
      customPermissions.additionalModules.includes(module.id) &&
      !modules.some((m) => m.id === module.id)
  )

  return [...modules, ...additionalModules]
}

// Función que obtiene módulos considerando permisos de rol Y de usuario
export const getModulesForUser = (
  role: UserRole,
  rolePermissions?: { additionalModules: string[]; removedModules: string[] },
  userPermissions?: { additionalModules: string[]; removedModules: string[] }
): ModuleConfig[] => {
  // Primero obtener módulos según el rol
  let modules = getModulesByRole(role, rolePermissions)

  // Si hay permisos de usuario, aplicarlos (sobrescriben los del rol)
  if (userPermissions) {
    // Filtrar módulos removidos por el usuario
    modules = modules.filter(
      (module) => !userPermissions.removedModules.includes(module.id)
    )

    // Agregar módulos adicionales del usuario
    const additionalModules = ALL_MODULES.filter(
      (module) =>
        userPermissions.additionalModules.includes(module.id) &&
        !modules.some((m) => m.id === module.id)
    )

    modules = [...modules, ...additionalModules]
  }

  return modules
}

export const getModuleById = (id: string): ModuleConfig | undefined => {
  return ALL_MODULES.find(module => module.id === id)
}

export const getModulesByCategory = (category: ModuleConfig['category'], role: UserRole): ModuleConfig[] => {
  return ALL_MODULES.filter(module => module.category === category && module.roles.includes(role))
}

export const CATEGORY_LABELS: Record<ModuleConfig['category'], string> = {
  principal: 'Principal',
  clinico: 'Clínico',
  administrativo: 'Administrativo',
  reportes: 'Reportes'
}
