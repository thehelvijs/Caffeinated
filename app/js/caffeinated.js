const electron = require("electron").remote;
const shell = require("electron").shell;
const dialog = electron.dialog;
const express = require("express");
const Store = require("electron-store");
const { app, ipcRenderer } = require("electron");
const { ipcMain, BrowserWindow } = require("electron").remote;

const PROTOCOLVERSION = 7;
const VERSION = "1.0." + PROTOCOLVERSION + "-pre2";

const koi = new Koi("wss://api.casterlabs.co/v1/koi");

let baseRepo = "https://caffeinated.casterlabs.co";
let CONNECTED = false;
let PLATFORMS = {};

console.warn("Caution, here be dragons!" + "\n\n" + "If someone tells you to paste code here, they might be trying to steal important data from you." + "\n" + "If you're good at UX, consider contributing to the Caffeinated project at " + "\n" + "https://github.com/thehelvijs/Caffeinated" + "\n");

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
                repos: [],
                cleared: []
            });

            console.log("reset!");
        }

        this.store.set("version", VERSION);
        this.store.set("protocol_version", PROTOCOLVERSION);

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

    triggerEvent(name, callback) {
        if (!this.store.get("cleared").contains(name)) {
            this.store.set("cleared", this.store.get("cleared").concat(name));

            callback();
        }
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

        FONTSELECT.preload();

        PLATFORMS = await (await fetch("https://api.casterlabs.co/v1/koi/platforms")).json();
        let platformsList = [];

        Object.values(PLATFORMS).forEach((platform) => {
            platformsList.push(platform.name);
        });

        MODULES.initalizeModule({
            displayname: "caffeinated.settings.title",
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
                username: {
                    display: "caffeinated.settings.username",
                    type: "input",
                    isLang: true
                },
                platform: {
                    display: "caffeinated.settings.platform",
                    type: "select",
                    isLang: true
                },
                currency: {
                    display: "caffeinated.settings.currency",
                    type: "currency",
                    isLang: true
                }
            },

            defaultSettings: {
                username: "",
                platform: platformsList,
                currency: "USD"
            }
        });

        this.store.set("repos", removeFromArray(this.store.get("repos"), "https://beta.casterlabs.co/caffeinated"));
        this.store.set("repos", removeFromArray(this.store.get("repos"), "https://caffeinated.casterlabs.co"));

        if (!this.store.get("dev")) {
            if (VERSION.includes("beta") || (this.store.get("channel") === "BETA")) {
                baseRepo = "https://beta.casterlabs.co/caffeinated";
            }

            await this.repomanager.addRepo(baseRepo);
        }

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
                    let loaded = MODULES.getFromUUID(namespace + ":" + id);

                    if (!loaded) {
                        MODULES.initalizeModule(new MODULES.moduleClasses[namespace](id));
                    }
                } catch (e) { } // Ignore, module not loaded because it's not present
            }
        }

        setTimeout(() => {
            if (!CONNECTED) {
                splashText(`
                    Having problems?
                    <a onclick="openLink('https://twitter.com/casterlabs');">
                        Tweet at us.
                    </a>
                `);
            }
        }, 30 * 1000); // Wait 30s, then show connection message.

        // Kickstart koi, a crucial part to the UI.
        koi.reconnect();

        const app = express();
        const cors = require("cors");
        const server = require("http").createServer(app);

        app.use(cors());

        this.io = require("socket.io").listen(server);

        this.io.on("connection", (socket) => {
            socket.on("uuid", (uuid) => {
                let holder = MODULES.getHolderFromUUID(uuid);

                if (holder) {
                    let module = holder.getInstance();

                    if (module.onConnection) module.onConnection(socket);

                    holder.sockets.push(socket);

                    socket.on("disconnect", () => {
                        removeFromArray(holder.sockets, socket);
                    });
                }
            });

            socket.emit("init");
        });

        server.listen(this.store.get("port"));
    }

    setDevEnviroment(value) {
        this.store.set("dev", value);

        location.reload();
    }

    setUserName(username) {
        document.querySelector(".user-username").innerHTML = '<ion-icon name="settings-outline"></ion-icon>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + username;
    }

    setUserPlatform(platform, link) {
        if (platform) {
            document.querySelector(".user-platform").src = PLATFORMS[platform].logo;
            document.querySelector(".user-platform").setAttribute("title", link);
        } else {
            document.querySelector(".user-platform").src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
            document.querySelector(".user-platform").setAttribute("title", "link");
        }
    }

    setUserImage(image, name) {
        document.querySelector(".user-icon").setAttribute("title", name);

        if (image) {
            if (image != document.querySelector(".user-icon").src) {
                document.querySelector(".user-icon").src = image;

                // anime({
                //     targets: ".placeholder-icon",
                //     easing: "linear",
                //     opacity: 0,
                //     duration: 250,
                // });
                // anime({
                //     targets: ".user-icon",
                //     easing: "linear",
                //     opacity: 1,
                //     duration: 250,
                // });
            }
        } else {
            document.querySelector(".user-icon").src = "media/icon.png";
            // anime({
            //     targets: ".placeholder-icon",
            //     easing: "linear",
            //     opacity: 1,
            //     duration: 250,
            // });
            // anime({
            //     targets: ".user-icon",
            //     easing: "linear",
            //     opacity: 0,
            //     duration: 250,
            // });
        }
    }

    setUser(user) {
        if (this.user !== null) {
            koi.removeUser(this.user);
        }

        this.user = user;
        this.setFollowerCount(null);
        this.setUserImage(null, "Set username in settings");
        this.setUserName("");
        this.setUserPlatform(null, "");

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
            // 1000 -> 1k if space is an issue
            // document.querySelector("#followers").innerText = kFormatter(count) + " followers";
            document.querySelector("#followers").innerText = count + " followers";

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

CAFFEINATED.setFollowerCount(null);
CAFFEINATED.setUserImage(null, "Set username in settings");
CAFFEINATED.setUserName("");
CAFFEINATED.setUserPlatform(null, "");

/* Koi */
koi.addEventListener("close", () => {
    splashText("Reconnecting to Casterlabs.");
    splashScreen(true);
    koi.reconnect();
});

koi.addEventListener("userupdate", (e) => {
    splashScreen(false);
    triggerWelcome();
    CAFFEINATED.setUserImage(e.streamer.image_link, e.streamer.username);
    CAFFEINATED.setUserName(e.streamer.username);
    CAFFEINATED.setFollowerCount(e.streamer.follower_count);
    CAFFEINATED.setUserPlatform(e.streamer.platform, e.streamer.link);

    CAFFEINATED.userdata = e;

    document.getElementById("casterlabs_caffeinated:settings").value = e.streamer.username;
    CAFFEINATED.store.set("user", e.streamer.username + ";" + e.streamer.platform);
});

koi.addEventListener("error", (event) => {
    let error = event.error;

    switch (error) {
        case "USER_ID_INVALID": {
            splashScreen(false);
            triggerWelcome();
            CAFFEINATED.store.delete("user");
            CAFFEINATED.user = null;
        }
    }
});

koi.addEventListener("open", () => {
    if (CAFFEINATED.user !== null) {
        koi.addUser(CAFFEINATED.user);
    } else {
        splashScreen(false);
        triggerWelcome();
    }

    if (CAFFEINATED.currency !== null) {
        koi.setCurrency(CAFFEINATED.currency);
        setCurrencyFormatter(CAFFEINATED.currency);
    }

    CONNECTED = true;
    splashText(null);
});

/* Sub menu handler */
Array.from(document.querySelectorAll(".menu-button")).forEach((dropdown) => {
    dropdown.addEventListener("click", () => {
        let dropdownContent = dropdown.nextElementSibling;

        dropdown.classList.toggle("active-sub");

        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
        } else {
            dropdownContent.style.display = "block";
        }
    });
});

document.querySelector(".close").addEventListener("click", () => {
    electron.getCurrentWindow().close();
});

document.querySelector(".minimize").addEventListener("click", () => {
    electron.getCurrentWindow().minimize();
});

document.querySelector(".minmax").addEventListener("click", () => {
    electron.getCurrentWindow().isMaximized() ? electron.getCurrentWindow().unmaximize() : electron.getCurrentWindow().maximize();
});

Array.from(document.querySelectorAll(".version-hover")).forEach((element) => {
    element.setAttribute("title", "Caffeinated " + VERSION);
});

function openLink(link) {
    shell.openExternal(link);
}

function kFormatter(num) {
    if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(1) + "t";
    } else if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + "b";
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "m";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "k";
    } else {
        return num;
    }
}

function sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

function triggerWelcome() {
    // CAFFEINATED.triggerEvent("welcome", () => {

    // navigate("welcome");
    // TODO Jake
    // Don't remove the comments, I'll do that -Lcyx

    // Code here

    //});
}
