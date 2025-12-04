import { ThemeMode } from '@shared/types'
import { IpcChannel } from '@shared/IpcChannel'
import type { PropsWithChildren } from 'react'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { setTheme as setStoreTheme, type NavbarPosition } from '../store/settingsSlice'

interface ThemeContextType {
  theme: ThemeMode // Tema actual (light o dark)
  settedTheme: ThemeMode // Tema configurado por el usuario
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: ThemeMode.light,
  settedTheme: ThemeMode.system,
  toggleTheme: () => {},
  setTheme: () => {}
})

const isWindows = navigator.userAgent.includes('Windows')
const isMac = navigator.userAgent.includes('Mac')

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch()
  const settedTheme = useAppSelector((state) => state.settings.theme) as ThemeMode
  const navbarPosition = useAppSelector((state) => state.settings.navbarPosition) as NavbarPosition
  const customCss = useAppSelector((state) => state.settings.customCss)

  const [actualTheme, setActualTheme] = useState<ThemeMode>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? ThemeMode.dark : ThemeMode.light
  )

  const toggleTheme = () => {
    const nextTheme = {
      [ThemeMode.light]: ThemeMode.dark,
      [ThemeMode.dark]: ThemeMode.system,
      [ThemeMode.system]: ThemeMode.light
    }[settedTheme]
    dispatch(setStoreTheme(nextTheme || ThemeMode.system))
  }

  const setTheme = (theme: ThemeMode) => {
    dispatch(setStoreTheme(theme))
  }

  // Aplicar tema al DOM
  useEffect(() => {
    document.body.setAttribute('os', isMac ? 'mac' : isWindows ? 'windows' : 'linux')
    document.body.setAttribute('theme-mode', actualTheme)
    document.body.setAttribute('navbar-position', navbarPosition)

    if (actualTheme === ThemeMode.dark) {
      document.body.classList.remove('light')
      document.body.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
      document.body.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [actualTheme, navbarPosition])

  // Aplicar CSS personalizado
  useEffect(() => {
    let styleElement = document.getElementById('custom-css-style')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'custom-css-style'
      document.head.appendChild(styleElement)
    }
    styleElement.textContent = customCss || ''
  }, [customCss])

  // Escuchar cambios de tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (settedTheme === ThemeMode.system) {
        setActualTheme(e.matches ? ThemeMode.dark : ThemeMode.light)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settedTheme])

  // Actualizar tema actual cuando cambia la configuración
  useEffect(() => {
    if (settedTheme === ThemeMode.system) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setActualTheme(isDark ? ThemeMode.dark : ThemeMode.light)
    } else {
      setActualTheme(settedTheme)
    }
  }, [settedTheme])

  // Sincronizar con el proceso principal
  useEffect(() => {
    // @ts-ignore - electron api
    window.api?.setTheme?.(settedTheme)
  }, [settedTheme])

  // Escuchar actualizaciones del tema desde el main process
  useEffect(() => {
    const handleThemeUpdate = (_event: unknown, theme: ThemeMode) => {
      setActualTheme(theme)
    }

    // @ts-ignore - electron ipcRenderer
    window.electron?.ipcRenderer?.on(IpcChannel.Theme_Updated, handleThemeUpdate)

    return () => {
      // @ts-ignore
      window.electron?.ipcRenderer?.removeListener(IpcChannel.Theme_Updated, handleThemeUpdate)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: actualTheme, settedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
