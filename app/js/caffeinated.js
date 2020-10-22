const electron = require("electron").remote;
const shell = require("electron").shell;
const dialog = electron.dialog;
const express = require("express");
const Store = require("electron-store");
const { ipcMain, BrowserWindow } = require("electron").remote;

const VERSION = "0.5.1-release";
const COLOR = "#FFFFFF";

const koi = new Koi("wss://api.casterlabs.co/v1/koi");
let CONNECTED = false;

console.warn("Caution, here be dragons!" + "\n\n" + "If someone tells you to paste code here, they might be trying to steal important data from you." + "\n" + "If you're good at UX, consider contributing to the Caffeinated project at " + "\n" + "https://github.com/thehelvijs/Caffeinated" + "\n");

Array.from(document.querySelectorAll(".spinner div")).forEach((element) => {
    element.style = "background-color: " + COLOR + ";";
});
document.querySelector(".settings-version").innerText = VERSION;
document.querySelector(".settings-version").style = "color: " + COLOR + ";";

class Caffeinated {
    constructor() {
        FONTSELECT.endPoint = "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyBuFeOYplWvsOlgbPeW8OfPUejzzzTCITM"; // TODO cache/proxy from Casterlabs' server

        this.store = new Store();

        if (!this.store.get("initalized")) {
            this.store.set({
                initalized: true,
                port: 8091,
                user: null,
                modules: {},
                repos: [
                    "https://caffeinated.casterlabs.co"
                ]
            });

            console.log("reset!");
        }

        this.store.set("version", VERSION);

        this.repomanager = new RepoManager();
        this.currency = this.store.get("currency");
        this.user = this.store.get("user");
        this.userdata = null;
    }

    async addRepo(repo) {
        repo = repo.replace("\\", "/");

        if (repo.endsWith("/")) {
            repo = repo.substring(repo, repo.length - 1);
        }

        await this.repomanager.addRepo(repo);

        this.store.set("repos", this.store.get("repos").concat(repo));
    }

    getRepos() {
        return this.store.get("repos");
    }

    removeRepo(repo) {
        repo = repo.replace("\\", "/");

        if (repo.endsWith("/")) {
            repo = repo.substring(repo, repo.length - 1);
        }

        this.store.set("repos", removeFromArray(this.store.get("repos"), repo));
        location.reload();
    }

    reset() {
        this.store.clear();
        location.reload();
    }

    async init() {
        console.log("init!");

        await FONTSELECT.preload(true);
        console.log("fonts loaded!");

        MODULES.initalizeModule({
            namespace: "casterlabs_caffeinated",
            type: "settings",
            persist: true,
            id: "settings",

            onSettingsUpdate() {
                if (this.settings.username == "reset") {
                    CAFFEINATED.reset();
                } else {
                    CAFFEINATED.setUser(this.settings.username + ";" + this.settings.platform);
                    CAFFEINATED.setCurrency(CURRENCY_TABLE[this.settings.currency]);
                }
            },

            getDataToStore() {
                return this.settings;
            },

            settingsDisplay: {
                username: "input",
                platform: "select",
                currency: "currency"
            },

            defaultSettings: {
                username: "",
                platform: [
                    "Caffeine",
                    "Twitch"
                ],
                currency: "USD"
            }

        });

        for (let repo of this.store.get("repos")) {
            try {
                await this.repomanager.addRepo(repo);
            } catch (e) {
                console.error(e);
            }
        }

        for (const [namespace, modules] of Object.entries(this.store.get("modules"))) {
            for (const [id, module] of Object.entries(modules)) {
                try {
                    let loaded = await MODULES.getFromUUID(namespace + ":" + id);

                    if (!loaded) {
                        MODULES.initalizeModule(new MODULES.moduleClasses[namespace](id));
                    }
                } catch (e) { } // Ignore, module not loaded because it's not present
            }
        }

        if (!this.user) {
            splashScreen(false);
        }

        const app = express();
        const cors = require("cors");
        const server = require("http").createServer(app);

        app.use(cors());

        server.listen(this.store.get("port"));

        this.io = require("socket.io").listen(server);

        this.io.on("connection", (socket) => {
            socket.on("uuid", (uuid) => {
                MODULES.getFromUUID(uuid).then((module) => {
                    if (module) {
                        if (module.onConnection) module.onConnection(socket);

                        module.sockets.push(socket);

                        socket.on("disconnect", () => {
                            removeFromArray(module.sockets, socket);
                        });
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
                duration: 250,
            });
            anime({
                targets: ".user-icon",
                easing: "linear",
                opacity: 1,
                duration: 250,
            });
        } else {
            anime({
                targets: ".placeholder-icon",
                easing: "linear",
                opacity: 1,
                duration: 250,
            });
            anime({
                targets: ".user-icon",
                easing: "linear",
                opacity: 0,
                duration: 250,
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

    setCurrency(currency) {
        this.currency = currency;

        koi.setCurrency(this.currency);
        setCurrencyFormatter(this.currency);
        this.store.set("currency", this.currency);
    }

    setFollowerCount(count) {
        if (count) {
            document.querySelector("#followers").innerText = count;

            anime({
                targets: "#followers",
                easing: "linear",
                opacity: 1,
                duration: 250,
            });
        } else {
            anime({
                targets: "#followers",
                easing: "linear",
                opacity: 0,
                duration: 250,
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
    CAFFEINATED.store.set("user", e.streamer.username + ";" + e.streamer.platform);
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

    if (CAFFEINATED.currency !== null) {
        koi.setCurrency(CAFFEINATED.currency);
        setCurrencyFormatter(CAFFEINATED.currency);
    }

    CONNECTED = true;
    splashText(null);
});

document.querySelector(".close").addEventListener("click", () => {
    electron.getCurrentWindow().close();
});

document.querySelector(".minimize").addEventListener("click", () => {
    electron.getCurrentWindow().minimize();
});

function openLink(link) {
    shell.openExternal(link);
}

setTimeout(() => {
    if (!CONNECTED) {
        splashText("problems");
    }
}, 30 * 1000); // Wait 1 minute, then show connection message.
