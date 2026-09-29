const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 640,
    minWidth: 320,
    minHeight: 480,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

ipcMain.on('window:minimize', () => win?.minimize());
ipcMain.on('window:close', () => win?.close());
ipcMain.handle('window:toggle-pin', () => {
  const pinned = !win.isAlwaysOnTop();
  win.setAlwaysOnTop(pinned);
  return pinned;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
