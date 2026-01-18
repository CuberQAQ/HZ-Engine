import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// Add IPC handlers
ipcMain.handle('select-project', async () => {
  const result = await dialog.showOpenDialog({
    title: '选择 hz_package.json',
    filters: [
      { name: 'HZ Package', extensions: ['json'] }
    ],
    properties: ['openFile']
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('get-image-size', async (_event, filePath: string) => {
  try {
    if (!filePath) return null
    const fs = require('node:fs/promises')
    const imageSize = require('image-size')
    const sizeOf = typeof imageSize === 'function' ? imageSize : (imageSize.default || imageSize.imageSize)
    
    let cleanPath = filePath
    if (filePath.startsWith('file://')) {
      try {
        cleanPath = fileURLToPath(filePath)
      } catch {
        cleanPath = filePath.replace(/^file:\/\/\/?/, '')
      }
    }
    
    const absolutePath = path.isAbsolute(cleanPath) ? cleanPath : path.join(process.env.APP_ROOT || '', cleanPath)
    
    // 使用 Buffer 方式调用，避免 image-size 内部路径解析问题
    const buffer = await fs.readFile(absolutePath)
    return sizeOf(buffer)
  } catch (e) {
    console.error('get-image-size error:', e)
    return null
  }
})

ipcMain.on('get-image-size-sync', (event, filePath: string) => {
  try {
    if (!filePath) {
      event.returnValue = null
      return
    }
    const fs = require('node:fs')
    const imageSize = require('image-size')
    const sizeOf = typeof imageSize === 'function' ? imageSize : (imageSize.default || imageSize.imageSize)
    
    let cleanPath = filePath
    if (filePath.startsWith('file://')) {
      try {
        cleanPath = fileURLToPath(filePath)
      } catch {
        cleanPath = filePath.replace(/^file:\/\/\/?/, '')
      }
    }

    const absolutePath = path.isAbsolute(cleanPath) ? cleanPath : path.join(process.env.APP_ROOT || '', cleanPath)
    
    // 使用 Buffer 方式调用
    if (fs.existsSync(absolutePath)) {
      const buffer = fs.readFileSync(absolutePath)
      event.returnValue = sizeOf(buffer)
    } else {
      event.returnValue = null
    }
  } catch (e) {
    console.error('get-image-size-sync error:', e)
    event.returnValue = null
  }
})

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    width: 500,
    height: 564, // 500 + 32(header) + 30(footer) + 2(border/padding)
    frame: false,
    resizable: false,
    center: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: false,
    },
  })

  ipcMain.on('window-close', () => {
    win?.close()
  })

  ipcMain.on('window-minimize', () => {
    win?.minimize()
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // 快捷键打开控制台
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win?.webContents.openDevTools()
      event.preventDefault()
    }
    if (input.key === 'F12') {
      win?.webContents.openDevTools()
      event.preventDefault()
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
