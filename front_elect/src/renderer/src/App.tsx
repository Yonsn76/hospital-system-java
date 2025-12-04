import { useEffect } from 'react'
import { ConfigProvider, theme } from 'antd'
import esES from 'antd/locale/es_ES'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from './store'
import { restoreSession, logout } from './store/authSlice'
import { fetchPermissions, resetAllPermissions } from './store/modulesSlice'
import { ThemeMode } from '@shared/types'
import { ThemeProvider, useTheme } from './context/ThemeProvider'
import { useUserTheme } from './hooks/useSettings'
import api from './services/api'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Citas from './pages/Citas'
import Pacientes from './pages/Pacientes'
import Doctores from './pages/Doctores'
import Calendario from './pages/Calendario'
import Configuracion from './pages/Configuracion'
import DisplaySettings from './pages/settings/DisplaySettings'
import HistoriaClinica from './pages/HistoriaClinica'
import NotasMedicas from './pages/NotasMedicas'
import Prescripciones from './pages/Prescripciones'
import Laboratorio from './pages/Laboratorio'
import ArchivosClinicos from './pages/ArchivosClinicos'
import Hospitalizacion from './pages/Hospitalizacion'
import GestionCamas from './pages/GestionCamas'
import Triaje from './pages/Triaje'
import Derivaciones from './pages/Derivaciones'
import Reportes from './pages/Reportes'
import Modulos from './pages/Modulos'
import GestionAccesos from './pages/GestionAccesos'

function AppContent() {
  const dispatch = useAppDispatch()
  const { theme: actualTheme } = useTheme()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  const { userTheme, initUserTheme } = useUserTheme()
  const isDark = actualTheme === ThemeMode.dark

  // Default values for userTheme
  const colorPrimary = userTheme?.colorPrimary || '#22c55e'
  const fontFamily = userTheme?.userFontFamily || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

  // Initialize user theme on mount
  useEffect(() => {
    initUserTheme()
  }, [initUserTheme])

  useEffect(() => {
    // Restore session from persisted state
    if (token && !api.getToken()) {
      dispatch(restoreSession(token))
    }

    // Listen for auth logout events
    const handleLogout = () => {
      dispatch(resetAllPermissions())
      dispatch(logout())
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [dispatch, token])

  // Cargar permisos del backend cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchPermissions())
    }
  }, [dispatch, isAuthenticated, token])

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: colorPrimary,
          colorSuccess: colorPrimary,
          borderRadius: 12,
          fontFamily: fontFamily,
          // Dark mode specific colors
          ...(isDark && {
            colorBgContainer: '#1f1f1f',
            colorBgElevated: '#222222',
            colorBgLayout: '#181818',
            colorBorder: '#333333',
            colorBorderSecondary: '#2a2a2a',
            colorText: 'rgba(255, 255, 245, 0.9)',
            colorTextSecondary: 'rgba(235, 235, 245, 0.6)',
            colorTextTertiary: 'rgba(235, 235, 245, 0.38)',
            colorBgSpotlight: '#333333'
          })
        },
        components: {
          Button: {
            borderRadius: 10
          },
          Card: {
            borderRadius: 16,
            ...(isDark && {
              colorBgContainer: '#1f1f1f',
              colorBorderSecondary: '#333333'
            })
          },
          Modal: {
            borderRadius: 20,
            ...(isDark && {
              contentBg: '#1f1f1f',
              headerBg: '#1f1f1f',
              footerBg: '#1f1f1f'
            })
          },
          Input: {
            borderRadius: 10,
            ...(isDark && {
              colorBgContainer: '#2a2a2a',
              colorBorder: '#333333'
            })
          },
          Select: {
            borderRadius: 10,
            ...(isDark && {
              colorBgContainer: '#2a2a2a',
              colorBgElevated: '#222222',
              optionSelectedBg: '#333333'
            })
          },
          Table: {
            ...(isDark && {
              colorBgContainer: '#1f1f1f',
              headerBg: '#222222',
              rowHoverBg: '#2a2a2a',
              borderColor: '#333333'
            })
          },
          Menu: {
            ...(isDark && {
              colorBgContainer: '#1f1f1f',
              itemSelectedBg: '#333333',
              itemHoverBg: '#2a2a2a'
            })
          },
          Dropdown: {
            ...(isDark && {
              colorBgElevated: '#222222'
            })
          }
        }
      }}
    >
      <HashRouter>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/modulos" element={<Modulos />} />
              <Route path="/citas" element={<Citas />} />
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/doctores" element={<Doctores />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/configuracion/display" element={<DisplaySettings />} />
              <Route path="/configuracion/accesos" element={<GestionAccesos />} />
              <Route path="/historia-clinica" element={<HistoriaClinica />} />
              <Route path="/notas-medicas" element={<NotasMedicas />} />
              <Route path="/prescripciones" element={<Prescripciones />} />
              <Route path="/laboratorio" element={<Laboratorio />} />
              <Route path="/archivos-clinicos" element={<ArchivosClinicos />} />
              <Route path="/hospitalizacion" element={<Hospitalizacion />} />
              <Route path="/gestion-camas" element={<GestionCamas />} />
              <Route path="/triaje" element={<Triaje />} />
              <Route path="/derivaciones" element={<Derivaciones />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )}
      </HashRouter>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
