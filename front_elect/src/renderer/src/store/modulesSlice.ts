import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { UserRole, ModulePermissionResponse } from '../services/api'
import api from '../services/api'

export interface ModuleItem {
  id: string
  path: string
  name: string
  icon: string
  description: string
  color: string
  roles: UserRole[]
}

// Permisos personalizados por rol (módulos adicionales o removidos)
export interface RolePermissions {
  additionalModules: string[] // Módulos extra que se agregan al rol
  removedModules: string[] // Módulos que se quitan del rol (de los por defecto)
}

// Permisos personalizados por usuario (sobrescriben los del rol)
export interface UserPermissions {
  username: string
  additionalModules: string[] // Módulos extra para este usuario
  removedModules: string[] // Módulos removidos para este usuario
}

export interface ModulesState {
  pinned: string[] // IDs de módulos fijados en el sidebar
  favorites: string[] // IDs de módulos favoritos
  recentlyUsed: string[] // IDs de módulos usados recientemente
  // Permisos personalizados por rol (solo ADMIN puede modificar)
  rolePermissions: Record<UserRole, RolePermissions>
  // Permisos personalizados por usuario (sobrescriben los del rol)
  userPermissions: Record<string, UserPermissions>
  // Estado de carga
  loading: boolean
  error: string | null
}

const initialState: ModulesState = {
  pinned: ['dashboard', 'citas', 'calendario'], // Módulos por defecto en sidebar
  favorites: [],
  recentlyUsed: [],
  rolePermissions: {
    ADMIN: { additionalModules: [], removedModules: [] },
    DOCTOR: { additionalModules: [], removedModules: [] },
    NURSE: { additionalModules: [], removedModules: [] },
    RECEPTIONIST: { additionalModules: [], removedModules: [] }
  },
  userPermissions: {},
  loading: false,
  error: null
}

// Thunks asíncronos para sincronizar con el backend
// Cargar permisos del usuario actual (funciona para cualquier usuario autenticado)
export const fetchPermissions = createAsyncThunk(
  'modules/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const permissions = await api.getMyPermissions()
      return permissions
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

// Cargar todos los permisos (solo para ADMIN en la gestión de accesos)
export const fetchAllPermissions = createAsyncThunk(
  'modules/fetchAllPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const permissions = await api.getAllPermissions()
      return permissions
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const savePermissionToBackend = createAsyncThunk(
  'modules/savePermission',
  async (
    data: { role: string; username?: string; moduleId: string; permissionType: 'ADDED' | 'REMOVED' },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.createOrUpdatePermission({
        role: data.role,
        username: data.username,
        moduleId: data.moduleId,
        permissionType: data.permissionType
      })
      return response
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

export const deletePermissionFromBackend = createAsyncThunk(
  'modules/deletePermission',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.deletePermission(id)
      return id
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  }
)

// Helper para convertir permisos del backend al formato del estado
const convertBackendPermissions = (permissions: ModulePermissionResponse[]) => {
  const rolePermissions: Record<UserRole, RolePermissions> = {
    ADMIN: { additionalModules: [], removedModules: [] },
    DOCTOR: { additionalModules: [], removedModules: [] },
    NURSE: { additionalModules: [], removedModules: [] },
    RECEPTIONIST: { additionalModules: [], removedModules: [] }
  }
  const userPermissions: Record<string, UserPermissions> = {}

  permissions.forEach((perm) => {
    if (perm.username) {
      // Permiso de usuario
      if (!userPermissions[perm.username]) {
        userPermissions[perm.username] = {
          username: perm.username,
          additionalModules: [],
          removedModules: []
        }
      }
      if (perm.permissionType === 'ADDED') {
        userPermissions[perm.username].additionalModules.push(perm.moduleId)
      } else {
        userPermissions[perm.username].removedModules.push(perm.moduleId)
      }
    } else {
      // Permiso de rol
      const role = perm.role as UserRole
      if (rolePermissions[role]) {
        if (perm.permissionType === 'ADDED') {
          rolePermissions[role].additionalModules.push(perm.moduleId)
        } else {
          rolePermissions[role].removedModules.push(perm.moduleId)
        }
      }
    }
  })

  return { rolePermissions, userPermissions }
}

const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    setPinnedModules: (state, action: PayloadAction<string[]>) => {
      state.pinned = action.payload
    },
    addPinnedModule: (state, action: PayloadAction<string>) => {
      if (!state.pinned.includes(action.payload)) {
        state.pinned.push(action.payload)
      }
    },
    removePinnedModule: (state, action: PayloadAction<string>) => {
      state.pinned = state.pinned.filter((id) => id !== action.payload)
    },
    togglePinnedModule: (state, action: PayloadAction<string>) => {
      const index = state.pinned.indexOf(action.payload)
      if (index === -1) {
        state.pinned.push(action.payload)
      } else {
        state.pinned.splice(index, 1)
      }
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.favorites.indexOf(action.payload)
      if (index === -1) {
        state.favorites.push(action.payload)
      } else {
        state.favorites.splice(index, 1)
      }
    },
    addRecentlyUsed: (state, action: PayloadAction<string>) => {
      state.recentlyUsed = state.recentlyUsed.filter((id) => id !== action.payload)
      state.recentlyUsed.unshift(action.payload)
      if (state.recentlyUsed.length > 5) {
        state.recentlyUsed = state.recentlyUsed.slice(0, 5)
      }
    },
    // Acciones locales para gestión de permisos (actualizan estado local)
    addModuleToRole: (state, action: PayloadAction<{ role: UserRole; moduleId: string }>) => {
      const { role, moduleId } = action.payload
      const permissions = state.rolePermissions[role]
      permissions.removedModules = permissions.removedModules.filter((id) => id !== moduleId)
      if (!permissions.additionalModules.includes(moduleId)) {
        permissions.additionalModules.push(moduleId)
      }
    },
    removeModuleFromRole: (state, action: PayloadAction<{ role: UserRole; moduleId: string }>) => {
      const { role, moduleId } = action.payload
      const permissions = state.rolePermissions[role]
      permissions.additionalModules = permissions.additionalModules.filter((id) => id !== moduleId)
      if (!permissions.removedModules.includes(moduleId)) {
        permissions.removedModules.push(moduleId)
      }
    },
    resetRolePermissions: (state, action: PayloadAction<UserRole>) => {
      state.rolePermissions[action.payload] = {
        additionalModules: [],
        removedModules: []
      }
    },
    resetAllPermissions: (state) => {
      state.rolePermissions = {
        ADMIN: { additionalModules: [], removedModules: [] },
        DOCTOR: { additionalModules: [], removedModules: [] },
        NURSE: { additionalModules: [], removedModules: [] },
        RECEPTIONIST: { additionalModules: [], removedModules: [] }
      }
      state.userPermissions = {}
    },
    addModuleToUser: (state, action: PayloadAction<{ username: string; moduleId: string }>) => {
      const { username, moduleId } = action.payload
      if (!state.userPermissions[username]) {
        state.userPermissions[username] = {
          username,
          additionalModules: [],
          removedModules: []
        }
      }
      const permissions = state.userPermissions[username]
      permissions.removedModules = permissions.removedModules.filter((id) => id !== moduleId)
      if (!permissions.additionalModules.includes(moduleId)) {
        permissions.additionalModules.push(moduleId)
      }
    },
    removeModuleFromUser: (state, action: PayloadAction<{ username: string; moduleId: string }>) => {
      const { username, moduleId } = action.payload
      if (!state.userPermissions[username]) {
        state.userPermissions[username] = {
          username,
          additionalModules: [],
          removedModules: []
        }
      }
      const permissions = state.userPermissions[username]
      permissions.additionalModules = permissions.additionalModules.filter((id) => id !== moduleId)
      if (!permissions.removedModules.includes(moduleId)) {
        permissions.removedModules.push(moduleId)
      }
    },
    resetUserPermissions: (state, action: PayloadAction<string>) => {
      delete state.userPermissions[action.payload]
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchPermissions
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false
        const { rolePermissions, userPermissions } = convertBackendPermissions(action.payload)
        state.rolePermissions = rolePermissions
        state.userPermissions = userPermissions
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // savePermissionToBackend
      .addCase(savePermissionToBackend.pending, (state) => {
        state.loading = true
      })
      .addCase(savePermissionToBackend.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(savePermissionToBackend.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // deletePermissionFromBackend
      .addCase(deletePermissionFromBackend.fulfilled, (state) => {
        state.loading = false
      })
      // fetchAllPermissions (para ADMIN)
      .addCase(fetchAllPermissions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllPermissions.fulfilled, (state, action) => {
        state.loading = false
        const { rolePermissions, userPermissions } = convertBackendPermissions(action.payload)
        state.rolePermissions = rolePermissions
        state.userPermissions = userPermissions
      })
      .addCase(fetchAllPermissions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setPinnedModules,
  addPinnedModule,
  removePinnedModule,
  togglePinnedModule,
  setFavorites,
  toggleFavorite,
  addRecentlyUsed,
  addModuleToRole,
  removeModuleFromRole,
  resetRolePermissions,
  resetAllPermissions,
  addModuleToUser,
  removeModuleFromUser,
  resetUserPermissions,
  clearError
} = modulesSlice.actions

export default modulesSlice.reducer
