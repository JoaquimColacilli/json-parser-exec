const { contextBridge, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternalLink: (url) => shell.openExternal(url),
});
