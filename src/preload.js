const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  restartApp: () => ipcRenderer.send('restart_app'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),

  saveJSON: (jsonData) => ipcRenderer.invoke('save-json', jsonData),
  loadJSONs: () => ipcRenderer.invoke('load-jsons'),
  deleteJSON: (filename) => ipcRenderer.invoke('delete-json', filename),
});
