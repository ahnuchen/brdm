import { MenuItemConstructorOptions } from 'electron'

export const trayMenus: MenuItemConstructorOptions[] = [
  {
    label: 'Home',
    click: (): void => {
      $tools.createWindow('Home')
    },
  },
  {
    label: 'About',
    click: (): void => {
      $tools.createWindow('About')
    },
  },
  { type: 'separator' },

  { label: 'Quit', role: 'quit' },
]
