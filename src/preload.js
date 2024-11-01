const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check_for_updates'),
  restartApp: () => ipcRenderer.send('restart_app'),
  onUpdateChecking: (callback) => ipcRenderer.on('update_checking', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update_not_available', callback),
  onUpdateError: (callback) => ipcRenderer.on('update_error', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('update_progress', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url)
});