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
const koi = new Koi("wss://live.casterlabs.co/koi");
const store = new Store();

app.use(cors());

class Caffeinated {
    io = require("socket.io").listen(server);

    constructor() {
        if (!store.get("initalized")) {
            this.reset();
        }

        this.user = store.get("user");
    }

    reset() {
        store.set({
            initalized: true,
            port: 8080,
            user: null,
            modules: {
                casterlabs_donation: {
                    donation: {}
                }

            }
        });
    }

    init() {
        console.log("init!");

        for (const [type, modules] of Object.entries(store.get("modules"))) {
            for (const [id, module] of Object.entries(modules)) {
                try {
                    MODULES.initalizeModule(new MODULES.moduleTypes[type](id), document.getElementById("settings"), document.getElementById("overlays"));
                } catch (e) {
                    console.warn(e)
                } // Ignore, module not loaded
            }
        }
    }

    setUser(user) {
        if (this.user !== null) {
            koi.removeUser(this.user);
        }

        this.user = user;

        koi.addUser(this.user);
    }

}

const CAFFEINATED = new Caffeinated();
const MODULES = new Modules();

/* Koi */
koi.addEventListener("close", () => {
    koi.reconnect();
});

koi.addEventListener("userupdate", (e) => {
    // document.getElementById("user_image").src = e.streamer.image_link; // TODO CSS to prevent problems...
    document.getElementById("username").innerText = e.streamer.username;

    console.log(e)
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

koi.addEventListener("open", () => {
    if (CAFFEINATED.user !== null) {
        koi.addUser(CAFFEINATED.user);
    }
});
