import Store from 'electron-store'
import { ThemeMode } from '@shared/types'

interface ConfigSchema {
  theme: ThemeMode
  language: string
  backupPath: string
}

class ConfigManager {
  private store: Store<ConfigSchema> | null = null

  async init(): Promise<void> {
    this.store = new Store<ConfigSchema>({
      name: 'config',
      defaults: {
        theme: ThemeMode.system,
        language: 'es',
        backupPath: ''
      }
    })
  }

  get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    if (!this.store) throw new Error('ConfigManager not initialized')
    return this.store.get(key)
  }

  set<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void {
    if (!this.store) throw new Error('ConfigManager not initialized')
    this.store.set(key, value)
  }
}

export const configManager = new ConfigManager()
