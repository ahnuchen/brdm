import { CreateSettings } from './create-settings'

export interface AppSettings {
  lang: string
  sideWidth: number
  zoomFactor: number
}

/** 窗口位置尺寸 */
export const appSettings = new CreateSettings<AppSettings>('app-settings')
