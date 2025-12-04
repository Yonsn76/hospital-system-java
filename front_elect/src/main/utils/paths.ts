import { app } from 'electron'
import { join } from 'path'

export function getDataPath(): string {
  return app.getPath('userData')
}

export function getFilesPath(): string {
  return join(getDataPath(), 'files')
}
