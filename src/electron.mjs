import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

// Configure autoUpdater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Log update events
autoUpdater.logger = {
  info(message) { console.log('Update Info:', message); },
  error(message) { console.error('Update Error:', message); },
  warn(message) { console.warn('Update Warning:', message); }
};

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development';
  win = new BrowserWindow({
    width: 1480,
    height: 1240,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.setMenuBarVisibility(false);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Update events
autoUpdater.on('checking-for-update', () => {
  win?.webContents.send('update_checking');
});

autoUpdater.on('update-available', (info) => {
  win?.webContents.send('update_available', info);
});

autoUpdater.on('update-not-available', (info) => {
  win?.webContents.send('update_not_available', info);
});

autoUpdater.on('error', (err) => {
  win?.webContents.send('update_error', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  win?.webContents.send('update_progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  win?.webContents.send('update_downloaded', info);
});

// IPC handlers
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall(false);
});

ipcMain.handle('check_for_updates', () => {
  if (!app.isPackaged) {
    return Promise.reject('App is not packaged');
  }
  return autoUpdater.checkForUpdates();
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

app.whenReady().then(() => {
  createWindow();
  
  // Check for updates after a small delay
  setTimeout(() => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdates();
    }
  }, 3000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});