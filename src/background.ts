import { app, protocol, BrowserWindow, Menu, remote } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
import initDownloader from './platform/downloader'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

async function createWindow() {
  Menu.setApplicationMenu(null)
  const win = new BrowserWindow({
    // width: isDevelopment ? 1560 : 1060,
    width: 1060,
    height: 640,
    fullscreenable: false, // 是否允许全屏
    backgroundColor: '#00000000', // 背景颜色
    frame: false,
    titleBarStyle: 'hiddenInset', // 标题栏的样式，有hidden、hiddenInset、customButtonsOnHover等
    resizable: false, // 是否允许拉伸大小
    transparent: true, // 是否是透明窗口（仅macOS）
    autoHideMenuBar: true,
    title: '听青',
    webPreferences: {
      // devTools: isDevelopment,
      devTools: false,
      webSecurity: false, //跨域限制
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      experimentalFeatures: true
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  // 窗口设置毛玻璃效果
  // win.setVibrancy('light');

  initDownloader()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow()
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
