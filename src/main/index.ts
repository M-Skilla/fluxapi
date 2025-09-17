import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import logo from '../../resources/logo.png?asset'
import path from 'path'
import Database from 'better-sqlite3'
import { collectionDao, requestDao, initSchema } from './db'
import axios, { AxiosResponse, AxiosError } from 'axios'

let db: Database.Database

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    title: 'FluxAPI',
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: logo } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function cleanupDatabase() {
  if (db) {
    try {
      // Drop all tables in reverse order due to foreign key constraints
      const tables = ['history', 'variables', 'environments', 'requests', 'collections']

      for (const table of tables) {
        db.prepare(`DROP TABLE IF EXISTS ${table}`).run()
      }

      console.log('Database tables cleaned up successfully')
    } catch (error) {
      console.error('Error cleaning up database:', error)
    } finally {
      db.close()
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  const dbPath = path.join(app.getPath('userData'), 'data.db')
  db = new Database(dbPath)

  await initSchema(db)
  collectionDao(ipcMain, db)
  requestDao(ipcMain, db)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Window controls
  ipcMain.handle('minimize-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.minimize()
  })

  ipcMain.handle('maximize-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      if (focusedWindow.isMaximized()) {
        focusedWindow.unmaximize()
      } else {
        focusedWindow.maximize()
      }
    }
  })

  ipcMain.handle('close-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) focusedWindow.close()
  })

  // HTTP Request handler
  ipcMain.handle('send-http-request', async (_event, config) => {
    const startTime = Date.now()

    try {
      const response: AxiosResponse = await axios({
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data,
        params: config.params,
        timeout: 30000 // 30 second timeout
      })

      const responseTime = Date.now() - startTime
      const size = JSON.stringify(response.data).length

      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          responseTime,
          size,
          url: config.url,
          method: config.method
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.response) {
          // Server responded with error status
          return {
            success: true,
            data: {
              status: axiosError.response.status,
              statusText: axiosError.response.statusText,
              headers: axiosError.response.headers,
              data: axiosError.response.data,
              responseTime,
              size: JSON.stringify(axiosError.response.data).length,
              url: config.url,
              method: config.method
            }
          }
        } else if (axiosError.request) {
          // Request was made but no response received
          return {
            success: false,
            error: `Network Error: ${axiosError.message}`
          }
        } else {
          // Something else happened
          return {
            success: false,
            error: `Request Error: ${axiosError.message}`
          }
        }
      } else {
        return {
          success: false,
          error: `Unknown Error: ${error}`
        }
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // cleanupDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Clean up database when app is about to quit (for macOS)
app.on('before-quit', () => {
  // cleanupDatabase()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
