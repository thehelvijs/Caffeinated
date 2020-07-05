const electron = require("electron").remote;
const dialog = electron.dialog
const express = require("express");
const Store = require("electron-store");
const {
    ipcMain,
    BrowserWindow
} = require("electron").remote

const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

const store = new Store();
// const koi = new Koi("wss://live.casterlabs.co/koi");

/* initalize the store */
if (!store.get("initalized")) {
    store.set({
        initalized: true,
        port: 8080,
        modules: {
            donation: {
                example: {}
            }
        }
    });
}

function init() {
    console.log("init!");

    for (const [type, modules] of Object.entries(store.get("modules"))) {
        for (const [id, module] of Object.entries(modules)) {
            try {
                MODULES.initalizeModule(new MODULES.moduleTypes[type](id));
            } catch (e) { } // Ignore, module not loaded
        }
    }
}

/*
koi.addEventListener("close", () => {
    koi.reconnect();
});

koi.addEventListener("error", () => {
    console.log(event);
    let error = event.error;
    switch (error) {
        case "USER_ID_INVALID":
            new Notification("User not found", "The user cannot be found.");
            splashScreen(false);
            store.delete("user");
            break;
    }
});
*/

/* Splash screen */
let splashActive = true;
function splashScreen(show) {
    let splash = document.getElementById("splash");
    let content = document.getElementById("content");

    if (!show) {
        /* Remove */
        if (splashActive) {
            splash.classList.add("hide");
            content.classList.remove("hide");
        }

        splashActive = false;
    } else {
        /* Generate */
        if (!splashActive) {
            splash.classList.remove("hide");
            content.classList.add("hide");
        }

        splashActive = true;
    }
}

function prettifyString(str) {
    let splitStr = str.split("_");

    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(" ");
}

function putInClipboard(copy) {
    navigator.clipboard.writeText("http://127.0.0.1:" + store.get("host_port") + "/" + copy);
}
