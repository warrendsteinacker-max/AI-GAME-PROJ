import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { exec } from 'child_process'
import { startLocalServer } from '../server/mainServer.js'
import { startInventoryServer } from '../server/inventoryServer.js'

let mainWindow = null
let runningServer = null
let runningInventoryServer = null

function sendStatus(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  }
}

function initializeAutomation() {
  // 1. Start Express API (port 5000)
  try {
    runningServer = startLocalServer()
    console.log('[MAIN] API server active on port 5000')
  } catch(e) {
    console.error('[MAIN] API server failed:', e)
  }

  // 2. Start HTTPS inventory server (port 3000)
  try {
    runningInventoryServer = startInventoryServer(app.isPackaged ? process.resourcesPath : null)
    if (runningInventoryServer) {
      sendStatus('server-status', { status: 'online', ip: '192.168.137.1', port: 3000 })
      console.log('[MAIN] HTTPS inventory server active on port 3000')
    }
  } catch(e) {
    console.error('[MAIN] Inventory server failed:', e)
  }

  // 3. Fire hotspot PowerShell script
  const scriptPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'src', 'server', 'toggleHotspot.ps1')
    : join(__dirname, '../../src/server/toggleHotspot.ps1')

  exec('powershell -ExecutionPolicy Bypass -File "' + scriptPath + '"', (err, stdout) => {
    if (err) {
      console.error('[MAIN] Hotspot error:', err.message)
      sendStatus('hotspot-status', { status: 'error' })
    } else {
      console.log('[MAIN] Hotspot:', stdout.trim())
      sendStatus('hotspot-status', {
        status: 'active',
        ssid: 'MyDesktopAppHotspot',
        pass: 'Password123'
      })
    }
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'MyDesktopApp',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // Send initial status after window is visible
    setTimeout(() => initializeAutomation(), 500)
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.mydesktopapp')
  app.on('browser-window-created', (_, w) => optimizer.watchWindowShortcuts(w))
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (runningServer?.close) runningServer.close()
  if (runningInventoryServer?.close) runningInventoryServer.close()
  if (process.platform !== 'darwin') app.quit()
})