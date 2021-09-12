const { BrowserWindow } = require("electron");
const windowStateKeeper = require("electron-window-state");

function createWindow(baseDir) {
    const mainWindowState = windowStateKeeper({
        defaultWidth: 700,
        defaultHeight: 500,
        file: "main-window.json"
    });

    // Create the browser window.
    let mainWindow = new BrowserWindow({
        minWidth: 700,
        minHeight: 500,
        width: mainWindowState.width,
        height: mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
        transparent: false,
        resizable: true,
        show: false,
        backgroundColor: "#141414",
        icon: baseDir + "/media/app_icon.png",
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile(baseDir + "/index.html");
    mainWindowState.manage(mainWindow);

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // Emitted when the window is ready to be shown
    // This helps in showing the window gracefully.
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    return mainWindow;
}

module.exports = createWindow;