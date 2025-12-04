import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api, { UserRole } from '../services/api'

interface User {
  username: string
  role: UserRole
  firstName?: string
  lastName?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

// Decode JWT to get user info
function decodeToken(token: string): User | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      username: decoded.sub,
      role: decoded.role as UserRole
    }
  } catch {
    return null
  }
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.login(username, password)
      api.setToken(response.token)
      const user = decodeToken(response.token)
      return { token: response.token, user }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error de autenticación')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (
    data: { username: string; password: string; email: string; firstName: string; lastName: string; role: UserRole },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.register(data)
      api.setToken(response.token)
      const user = decodeToken(response.token)
      return { token: response.token, user }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error en el registro')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      api.setToken(null)
    },
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      api.setToken(action.payload.token)
    },
    clearError: (state) => {
      state.error = null
    },
    restoreSession: (state, action: PayloadAction<string>) => {
      const token = action.payload
      const user = decodeToken(token)
      if (user) {
        state.token = token
        state.user = user
        state.isAuthenticated = true
        api.setToken(token)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { logout, setCredentials, clearError, restoreSession } = authSlice.actions
export default authSlice.reducer
