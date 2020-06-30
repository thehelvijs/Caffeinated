// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const windowStateKeeper = require('electron-window-state');

function createWindow () {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 420,
    defaultHeight: 330,
    file: 'main-window.json'
  });

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 420,
    height: 330,
    // maxWidth : 350,
    // maxHeight : 250,
    // minWidth: 350,
    // minHeight: 250,
    x: mainWindowState.x,
    y: mainWindowState.y,
    resizable: false,
    transparent: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1a1a1a',
    icon: __dirname + '/media/app_icon.png',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '/js/preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindowState.manage(mainWindow);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// app.commandLine.appendSwitch("disable-gpu")
// app.commandLine.appendSwitch('disable-gpu-compositing')
// app.commandLine.appendSwitch('disable-accelerated-video-decode')
// app.commandLine.appendSwitch('disable-accelerated-video-encode')
app.disableHardwareAcceleration();
// app.commandLine.appendSwitch("disable-software-rasterizer");

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
