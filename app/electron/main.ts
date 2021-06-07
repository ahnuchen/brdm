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
  $tools.createWindow('Home')
  globalShortcut.unregister('CommandOrControl+W')
  //TODO 暂时先不要tray隐藏,开发时热更新导致这个tray会越来越多
  // tray.destroy()
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
})

app.on('before-quit', () => {
  $tools.log.info(`Application <${$tools.APP_NAME}> has exited normally.`)

  if (process.platform === 'win32') {
    tray.destroy()
  }
})
