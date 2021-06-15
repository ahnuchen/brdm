import { app, Tray, globalShortcut } from 'electron'

import { creatAppTray } from './tray'

$tools.log.info(`Application <${$tools.APP_NAME}> launched.`)

let tray: Tray

app.allowRendererProcessReuse = true

const appLock = app.requestSingleInstanceLock()

if (!appLock) {
  // 作为第二个实例运行时, 主动结束进程
  app.quit()
}

app.on('second-instance', () => {
  // 当运行第二个实例时, 打开或激活首页
  $tools.createWindow('Home')
})

app.on('ready', () => {
  tray = creatAppTray()
  $tools.createWindow('Home').then((win) => {
    win.on('focus', function () {
      // MouseTrap cannot cover default system keyboard shortcut CommandOrControl+W,
      // so use electron globalShortcut
      globalShortcut.register('CommandOrControl+W', function () {
        return win.webContents.send('closeTab')
      })
    })

    win.on('blur', function () {
      globalShortcut.unregisterAll()
    })
  })
})

app.on('activate', () => {
  if (process.platform == 'darwin') {
    $tools.createWindow('Home')
  }
})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  tray.destroy()
  globalShortcut.unregisterAll()
})

app.on('before-quit', () => {
  $tools.log.info(`Application <${$tools.APP_NAME}> has exited normally.`)

  if (process.platform === 'win32') {
    tray.destroy()
  }
})
