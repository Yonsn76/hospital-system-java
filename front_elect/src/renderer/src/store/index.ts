import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createTransform
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import settingsReducer from './settingsSlice'
import uiReducer from './uiSlice'
import authReducer from './authSlice'
import modulesReducer from './modulesSlice'

// Transform para excluir permisos de la persistencia (se cargan del backend)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modulesTransform = createTransform(
  // Transform al guardar: solo guardar pinned, favorites, recentlyUsed
  (inboundState: any) => ({
    pinned: inboundState.pinned,
    favorites: inboundState.favorites,
    recentlyUsed: inboundState.recentlyUsed
  }),
  // Transform al cargar: restaurar solo lo guardado, permisos se cargan del backend
  (outboundState: any) => ({
    pinned: outboundState?.pinned || ['dashboard', 'citas', 'calendario'],
    favorites: outboundState?.favorites || [],
    recentlyUsed: outboundState?.recentlyUsed || [],
    rolePermissions: {
      ADMIN: { additionalModules: [], removedModules: [] },
      DOCTOR: { additionalModules: [], removedModules: [] },
      NURSE: { additionalModules: [], removedModules: [] },
      RECEPTIONIST: { additionalModules: [], removedModules: [] }
    },
    userPermissions: {},
    loading: false,
    error: null
  }),
  { whitelist: ['modules'] }
)

const rootReducer = combineReducers({
  settings: settingsReducer,
  ui: uiReducer,
  auth: authReducer,
  modules: modulesReducer
})

const persistConfig = {
  key: 'citas-medic',
  version: 2,
  storage,
  whitelist: ['settings', 'auth', 'modules'],
  transforms: [modulesTransform]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedReducer = persistReducer(persistConfig, rootReducer as any)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
