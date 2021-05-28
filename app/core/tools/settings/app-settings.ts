import { CreateSettings } from './create-settings'

export interface AppSettings {
  lang: string
}

/** 窗口位置尺寸 */
export const appSettings = new CreateSettings<AppSettings>('app-settings')
