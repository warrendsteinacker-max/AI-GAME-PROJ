import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { exec } from 'child_process';
import { startLocalServer } from '../server/mainServer.js';
import { startInventoryServer } from '../server/inventoryServer.js';

let runningServer = null;
let runningInventoryServer = null;

function initializeAutomation() {
  // Start Express API server (port 5000)
  try {
    runningServer = startLocalServer();
    console.log("Local API server active on port 5000.");
  } catch(e) {
    console.error("API server failed:", e);
  }

  // Start HTTPS barcode/inventory server (port 3000)
  try {
    runningInventoryServer = startInventoryServer(app.isPackaged ? process.resourcesPath : null);
    console.log("HTTPS inventory server active on port 3000.");
  } catch(e) {
    console.error("Inventory server failed:", e);
  }

  // Fire hotspot PowerShell script
  const scriptPath = app.isPackaged
    ? join(process.resourcesPath, 'app.asar.unpacked', 'src', 'server', 'toggleHotspot.ps1')
    : join(__dirname, '../../src/server/toggleHotspot.ps1');

  exec('powershell -ExecutionPolicy Bypass -File "' + scriptPath + '"', (err, stdout) => {
    if (err) console.error("Hotspot error:", err.message);
    else console.log("Hotspot:", stdout.trim());
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  win.on('ready-to-show', () => win.show());

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');
  app.on('browser-window-created', (_, w) => optimizer.watchWindowShortcuts(w));
  initializeAutomation();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (runningServer?.close) runningServer.close();
  if (runningInventoryServer?.close) runningInventoryServer.close();
  if (process.platform !== 'darwin') app.quit();
});