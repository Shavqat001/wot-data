const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  launchWOT: (path) => ipcRenderer.send('launch-wot', path),
  browseLauncher: () => ipcRenderer.invoke('browse-launcher'),
  setLauncherPath: (p) => ipcRenderer.send('set-launcher-path', p),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isElectron: true,
})
