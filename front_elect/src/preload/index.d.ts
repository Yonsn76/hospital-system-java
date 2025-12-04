import type { ApiType, ElectronType } from './index'

declare global {
  interface Window {
    api: ApiType
    electron: ElectronType
  }
}
