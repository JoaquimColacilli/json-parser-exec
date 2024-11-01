import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronUpdater from 'electron-updater';

const { autoUpdater } = electronUpdater;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

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
autoUpdater.on("download-progress", (info) =>{
  win?.webContents.send("checkingUdp", "Installing...");
  console.log("not", info);
})

autoUpdater.on("update-not-available", (info) => {
  win?.webContents.send("checkingUdp", "");
  console.log("not", info);
});

autoUpdater.on("error", (error) => {
  win?.webContents.send("checkingUdp", error);
  console.error("Error during update check:", error);
});

autoUpdater.on("update-available", (_event) => {
  win?.webContents.send("checkingUdp", "Installing...");
  const dialogOpts = {
    type: 'info',
    buttons: ['Ok'],
    title: `Questify Update Available`,
    message: `A new ${autoUpdater.channel} version download started.`,
  };
  if (!updateCheck) {
    dialog.showMessageBox(dialogOpts);
    updateCheck = true;
    let pth = autoUpdater.downloadUpdate();
    win?.webContents.send("checkingUdp", pth);
  }
});

autoUpdater.on("update-downloaded", (_event) => {
  if (!updateFound) {
      updateFound = true;

      setTimeout(() => {
          autoUpdater.quitAndInstall(true,true);
      }, 3500);
  }
});


app.whenReady().then( async() => {

  autoUpdater.checkForUpdatesAndNotify();

  win?.webContents.on("did-finish-load", async () => {
    if (win) {
      win?.webContents.send("checkingUdp", "Checking for updates");
      
      const tray = new Tray(nativeImage.createFromPath(iconPath));
      tray.setImage(iconPath);

      tray.setToolTip("Json Parser APP");
      tray.on("double-click", () => {
        win?.isVisible() ? win?.hide() : win?.show();
      });

      let config = readConfig();
      win?.setAlwaysOnTop(config.keepOnTop, "screen-saver", 1);
      const version = app.getVersion();

      let template = [
        { label: `Version: ${version}` },
        { type: "separator" },
        {
          label: "System Tray",
          type: "checkbox",
          checked: config.keepTrayActive,
          click: async () => {
            config.keepTrayActive = !config.keepTrayActive;
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

            template[2].checked = config.keepTrayActive;

            const contextMenu = Menu.buildFromTemplate(template);
            tray.setContextMenu(contextMenu);
          },
        },
        {
          label: "Always on top",
          type: "checkbox",
          checked: config.keepOnTop,
          click: async () => {
            config.keepOnTop = !config.keepOnTop;
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));

            template[3].checked = config.keepOnTop;

            win?.setAlwaysOnTop(config.keepOnTop, "screen-saver", 1);
            const contextMenu = Menu.buildFromTemplate(template);
            tray.setContextMenu(contextMenu);
          },
        },
        {
          label: "Exit",
          click: async () => {
            win?.close();
          },
        },
      ];

      let contextMenu = Menu.buildFromTemplate(template);
      tray.setContextMenu(contextMenu);
    } else {
      console.error("Window not yet created. Unable to send message.");
    }
  });
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