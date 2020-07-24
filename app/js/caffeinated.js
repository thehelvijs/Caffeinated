const electron = require("electron").remote;
const shell = require("electron").shell;
const dialog = electron.dialog
const express = require("express");
const Store = require("electron-store");
const {
    ipcMain,
    BrowserWindow
} = require("electron").remote

const VERSION = "0.4.0-pre1";
const COLOR = "#FFFFFF";

const koi = new Koi("wss://live.casterlabs.co/koi");
let CONNECTED = false;

console.warn(
    "Caution, here be dragons!" + "\n\n" +
    "If someone tells you to paste code here, they might be trying to steal important data from you." + "\n" +
    "If you're good at UX, consider contributing to the Caffeinated project at " + "\n" +
    "https://github.com/thehelvijs/Caffeinated" + "\n"
);

Array.from(document.querySelectorAll(".spinner div")).forEach((element) => {
    element.style = "background-color: " + COLOR + ";";
});
document.querySelector(".settings-version").innerText = VERSION;
document.querySelector(".settings-version").style = "color: " + COLOR + ";";

class Caffeinated {
    constructor() {
        const app = express();
        const cors = require("cors");
        const server = require("http").createServer(app);

        app.use(cors());

        this.store = new Store();

        if (!this.store.get("initalized")) {
            this.store.set({
                initalized: true,
                port: 8091,
                user: null,
                modules: {
                    casterlabs_caffeinated: {
                        settings: {}
                    },
                    casterlabs_donation: {
                        donation: {}
                    },
                    casterlabs_follower: {
                        follower: {}
                    },
                    casterlabs_chat: {
                        chat: {}
                    },
                    casterlabs_info: {
                        topdonation: {},
                        recentdonation: {},
                        recentfollow: {}
                    }
                }
            });
            console.log("reset!");
        }

        server.listen(this.store.get("port"));

        this.io = require("socket.io").listen(server);
        this.user = this.store.get("user");
        this.userdata = null;
    }

    reset() {
        this.store.set("initalized", false);
        location.reload();
    }

    init() {
        console.log("init!");

        for (const [namespace, modules] of Object.entries(this.store.get("modules"))) {
            for (const [id, module] of Object.entries(modules)) {
                try {
                    MODULES.initalizeModule(new MODULES.moduleClasses[namespace](id));
                } catch (e) {
                    console.warn(e)
                } // Ignore, module not loaded
            }
        }

        if (!this.user) {
            splashScreen(false);
        }

        this.io.on("connection", (socket) => {
            socket.on("uuid", (uuid) => {
                MODULES.getFromUUID(uuid).then((module) => {
                    if (module && module.onConnection) {
                        module.onConnection(socket);
                    }
                });
            });

            socket.emit("init");
        });
    }

    setUserImage(image) {
        if (image) {
            if (image != document.querySelector(".user-icon").src) {
                document.querySelector(".user-icon").src = image;
            }

            anime({
                targets: ".placeholder-icon",
                easing: "linear",
                opacity: 0,
                duration: 250
            });
            anime({
                targets: ".user-icon",
                easing: "linear",
                opacity: 1,
                duration: 250
            });
        } else {
            anime({
                targets: ".placeholder-icon",
                easing: "linear",
                opacity: 1,
                duration: 250
            });
            anime({
                targets: ".user-icon",
                easing: "linear",
                opacity: 0,
                duration: 250
            });
        }
    }

    setUser(user) {
        if (this.user !== null) {
            koi.removeUser(this.user);
        }

        this.user = user;
        this.setFollowerCount(null);
        this.setUserImage(null);

        koi.addUser(this.user);
    }

    setFollowerCount(count) {
        if (count) {
            document.querySelector("#followers").innerText = count;

            anime({
                targets: "#followers",
                easing: "linear",
                opacity: 1,
                duration: 250
            });
        } else {
            anime({
                targets: "#followers",
                easing: "linear",
                opacity: 0,
                duration: 250
            });
        }
    }

}

const CAFFEINATED = new Caffeinated();
const MODULES = new Modules();

/* Koi */
koi.addEventListener("close", () => {
    splashText("reconnecting");
    splashScreen(true);
    koi.reconnect();
});

koi.addEventListener("userupdate", (e) => {
    splashScreen(false);
    CAFFEINATED.setUserImage(e.streamer.image_link);
    CAFFEINATED.setFollowerCount(e.streamer.follower_count);

    CAFFEINATED.userdata = e;

    document.getElementById("casterlabs_caffeinated:settings").value = e.streamer.username;
    CAFFEINATED.store.set("user", e.streamer.username /* + ";" + e.streamer.platform */);
});

koi.addEventListener("error", (event) => {
    let error = event.error;

    switch (error) {
        case "USER_ID_INVALID": {
            splashScreen(false);
            CAFFEINATED.store.delete("user");
            CAFFEINATED.user = null;
        }
    }
});

koi.addEventListener("open", () => {
    if (CAFFEINATED.user !== null) {
        koi.addUser(CAFFEINATED.user);
    }

    CONNECTED = true;
    splashText(null);
});

document.querySelector(".close").addEventListener("click", () => {
    electron.getCurrentWindow().close();
});

function openLink(link) {
    shell.openExternal(link);
}

setTimeout(() => {
    if (!CONNECTED) {
        splashText("problems");
    }
}, 30 * 1000); // Wait 1 minute, then show connection message.
