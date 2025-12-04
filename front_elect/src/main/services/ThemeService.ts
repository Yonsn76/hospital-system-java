import { BrowserWindow, nativeTheme } from 'electron'
import { IpcChannel } from '@shared/IpcChannel'
import { ThemeMode } from '@shared/types'
import { configManager } from './ConfigManager'

class ThemeService {
  private theme: ThemeMode = ThemeMode.system

  init() {
    const savedTheme = configManager.get('theme') as ThemeMode
    this.theme = savedTheme || ThemeMode.system
    nativeTheme.themeSource = this.theme
    nativeTheme.on('updated', this.handleThemeUpdate.bind(this))
  }

  private handleThemeUpdate() {
    const actualTheme = nativeTheme.shouldUseDarkColors ? ThemeMode.dark : ThemeMode.light
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win && !win.isDestroyed()) {
        win.webContents.send(IpcChannel.Theme_Updated, actualTheme)
      }
    })
  }

  setTheme(theme: ThemeMode) {
    if (theme === this.theme) return
    this.theme = theme
    nativeTheme.themeSource = theme
    configManager.set('theme', theme)
  }

  getActualTheme(): ThemeMode {
    return nativeTheme.shouldUseDarkColors ? ThemeMode.dark : ThemeMode.light
  }
}

export const themeService = new ThemeService()
