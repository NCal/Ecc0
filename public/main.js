const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 200,
    backgroundColor: '#111',
    resizable: false,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      enableRemoteModule: true,
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  const startURL = `file://${path.join(__dirname, './index.html')}`;

  win.loadURL(startURL);

  win.webContents.on('did-finish-load', (event) => {
    win.webContents.setZoomFactor(1)
  })

  win.webContents.on('before-input-event', (event, input) => {
    if (input.meta && (input.code === 'Minus' || input.code === 'Equal')) {
      event.preventDefault()
    }
  })

  win.webContents.on('zoom-changed', (event, zoomDirection) => {
    win.webContents.setZoomFactor(1)
  })

  win.on('closed', () => (mainWindow = null));

}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    app.quit();
});

// Activate window (for macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});