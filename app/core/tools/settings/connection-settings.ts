import { CreateSettings } from './create-settings'

export interface ConnectionSettings {
  [key: string]: ConnectionConfig
}

/** 窗口位置尺寸 */
export const connSettings = new CreateSettings<ConnectionSettings>('connections')
