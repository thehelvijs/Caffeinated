// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const windowStateKeeper = require("electron-window-state");

function createWindow() {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 600,
        defaultHeight: 500,
        file: "main-window.json"
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        minWidth: 600,
        minHeight: 500,
        width: 600, // mainWindowState.width,
        height: 500, // mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
        transparent: false,
        resizable: false,
        backgroundColor: "#141414",
        icon: __dirname + "/media/app_icon.png",
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile("index.html")

    mainWindowState.manage(mainWindow);
}

// Disable web cache.
app.commandLine.appendSwitch("disable-http-cache");

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") app.quit()
})

app.on("activate", function () {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.disableHardwareAcceleration();