const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let launcherPath = 'D:\\programs\\Lesta\\GameCenter\\lgc.exe'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0d0d0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Launch WOT
  ipcMain.on('launch-wot', (event, customPath) => {
    const targetPath = customPath || launcherPath
    if (fs.existsSync(targetPath)) {
      exec(`"${targetPath}"`)
    } else {
      // Try fallback paths
      const fallbacks = [
        'D:\\programs\\Lesta\\GameCenter\\lgc.exe',
        'C:\\Games\\Lesta\\GameCenter\\lgc.exe',
        'C:\\Games\\World_of_Tanks\\WoTLauncher.exe',
        'C:\\Program Files (x86)\\Wargaming.net\\GameCenter\\wgc_api.exe',
      ]
      const found = fallbacks.find(p => fs.existsSync(p))
      if (found) exec(`"${found}"`)
      else shell.openExternal('wotgame://')
    }
  })

  // Browse for launcher
  ipcMain.handle('browse-launcher', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Game Launcher',
      filters: [{ name: 'Executable', extensions: ['exe'] }],
      properties: ['openFile']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Set launcher path from renderer
  ipcMain.on('set-launcher-path', (event, p) => { launcherPath = p })

  // Window controls
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize())
  ipcMain.on('window-close', () => win.close())
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
