// electron.js
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let win;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.logger = {
  info(message) { console.log('Update Info:', message); },
  error(message) { console.error('Update Error:', message); },
  warn(message) { console.warn('Update Warning:', message); }
};

const userDataPath = app.getPath('userData');
const jsonDir = path.join(userDataPath, 'jsons');

if (!fs.existsSync(jsonDir)) {
  fs.mkdirSync(jsonDir);
}

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

  win.loadURL(
    isDev
      ? "http://localhost:5173"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
    require('react-devtools-electron');
  }

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización disponible',
    message: 'Una nueva versión está siendo descargada.'
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización lista',
    message: 'Una nueva versión ha sido descargada. Reinicia la aplicacion para aplicar los cambios.',
    buttons: ['Reiniciar', 'Después']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log('Download progress:', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('save-json', async (event, jsonData) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `json-${timestamp}.json`;
  const filePath = path.join(jsonDir, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    return { success: true, filename };
  } catch (error) {
    console.error('Error al guardar el JSON:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-jsons', async () => {
  try {
    const files = fs.readdirSync(jsonDir);
    const jsons = files.map((file) => {
      const filePath = path.join(jsonDir, file);
      const data = fs.readFileSync(filePath, 'utf8');
      return {
        filename: file,
        data: JSON.parse(data),
        timestamp: fs.statSync(filePath).mtime
      };
    });
    return { success: true, jsons };
  } catch (error) {
    console.error('Error al cargar los JSONs:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-json', async (event, filename) => {
  const filePath = path.join(jsonDir, filename);

  try {
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar el JSON:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.on('open-external-link', (event, url) => {
  shell.openExternal(url);
});

