const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ventana', {
  minimizar: () => ipcRenderer.send('window:minimize'),
  cerrar: () => ipcRenderer.send('window:close'),
  alternarFijado: () => ipcRenderer.invoke('window:toggle-pin'),
});
