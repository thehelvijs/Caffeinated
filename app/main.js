// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const electronDl = require("electron-dl");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const windowStateKeeper = require("electron-window-state");

const WINDOWS_UPDATE_SCRIPT = `
@echo off

:loop
    cls
    echo Updating Caffeinated...
    title Updating Caffeinated...

    tasklist | find /i "caffeinated" >nul 2>&1

    if ERRORLEVEL 1 (
        GOTO continue
    ) else (
        timeout /t 1 /nobreak
        goto loop
    )

:continue
    del .\\resources\\app.asar
    rename .\\resources\\update.asar app.asar
    cmd /c start "" ".\\caffeinated.exe"
    exit
`;

function createWindow() {
    let mainWindowState = windowStateKeeper({
        defaultWidth: 700,
        defaultHeight: 500,
        file: "main-window.json"
    });

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        minWidth: 700,
        minHeight: 500,
        width: mainWindowState.width,
        height: mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
        transparent: false,
        resizable: true,
        backgroundColor: "#141414",
        icon: __dirname + "/media/app_icon.png",
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    ipcMain.on("download-update", async (event, { updates, url }) => {
        console.log("Downloading update from: " + url);
        const directory = __dirname.replace("app.asar", "");

        await electronDl.download(mainWindow, url, {
            directory: directory,
            filename: "update.asar"
        });

        if (process.platform.includes("win")) {
            fs.writeFile("updater.bat", WINDOWS_UPDATE_SCRIPT, () => {
                execute("cmd /c start updater.bat");

                app.exit(0);
            });
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile("index.html")

    mainWindowState.manage(mainWindow);
}

function execute(command) {
    exec(command, (error, stdout, stderr) => { });
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