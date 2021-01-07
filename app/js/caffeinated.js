const electron = require("electron").remote;
const shell = require("electron").shell;
const dialog = electron.dialog;
const express = require("express");
const Store = require("electron-store");
const { app, ipcRenderer } = require("electron");
const { ipcMain, BrowserWindow } = require("electron").remote;
const windowStateKeeper = require("electron-window-state");

const PROTOCOLVERSION = 16;
const VERSION = "1.0-beta7";

const koi = new Koi("wss://api.casterlabs.co/v2/koi");

let CONNECTED = false;
let PLATFORMS = {};

console.warn(`
Caution, here be dragons!
If someone tells you to paste code here, they might be trying to steal important data from you.
If you're good at UX, consider contributing to the Caffeinated project at https://github.com/thehelvijs/Caffeinated
`);

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

        if (this.store.get("dev")) {
            this.store.set("protocol_version", -1);
        } else {
            this.store.set("version", VERSION);
            this.store.set("protocol_version", PROTOCOLVERSION);
        }

        this.repomanager = new RepoManager();

        this.token = this.store.get("token");
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

            settingsDisplay: {
                signout: {
                    display: "caffeinated.settings.signout",
                    type: "button",
                    isLang: true
                }
            },

            defaultSettings: {
                signout: () => {
                    CAFFEINATED.setToken(null)
                }
            }
        });

        this.store.set("repos", removeFromArray(this.store.get("repos"), "https://beta.casterlabs.co/caffeinated"));
        this.store.set("repos", removeFromArray(this.store.get("repos"), "https://caffeinated.casterlabs.co"));

        await this.repomanager.addRepo(__dirname + "/modules", false);

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

        // Kickstart koi, a crucial part to the UI.
        koi.reconnect();
    }

    setDevEnviroment(value) {
        this.store.set("dev", value);

        location.reload();
    }

    setUserName(username, badges) {
        const element = document.querySelector(".user-username");

        element.innerHTML = '<ion-icon name="settings-outline"></ion-icon>&nbsp;&nbsp;&nbsp;&nbsp;';

        if (username) {
            element.innerHTML += "&nbsp;&nbsp;" + escapeHtml(username);

            badges.forEach((badge) => {
                element.innerHTML += `<img style="height: 1.1em; transform: translateY(.25em); padding-left: 3px;" src=${badge} />`;
            })
        }
    }

    setUserPlatform(platform, link) {
        if (platform) {
            document.querySelector(".user-platform").src = PLATFORMS[platform].logo;
            document.querySelector(".user-platform").setAttribute("title", link);
        } else {
            document.querySelector(".user-platform").src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
            document.querySelector(".user-platform").setAttribute("title", "");
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

    setToken(token) {
        if (token) {

            this.token = token;
            CAFFEINATED.store.set("token", this.token);

            loginScreen("SUCCESS");

            this.setFollowerCount(null);
            this.setUserImage(null, "");
            this.setUserName("");
            this.setUserPlatform(null, "");

            koi.reconnect();
        } else {
            this.signOut();
        }
    }

    setFollowerCount(count) {
        if (count && (count >= 0)) {
            const formatted = kFormatter(count, 1);
            const followers_count_text = getTranslation("caffeinated.internal.followers_count_text");

            document.querySelector("#followers").innerText = `${formatted} ${followers_count_text}`;

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

    signOut() {
        fetch("https://api.casterlabs.co/v2/natsukashii/revoke", {
            headers: new Headers({
                authorization: "Bearer " + CAFFEINATED.token
            })
        }).finally(() => {
            this.token = null;
            CAFFEINATED.store.delete("token");

            this.setFollowerCount(null);
            this.setUserImage(null, "");
            this.setUserName("");
            this.setUserPlatform(null, "");

            koi.reconnect();
        });
    }

}

const CAFFEINATED = new Caffeinated();
const MODULES = new Modules();

CAFFEINATED.setFollowerCount(null);
CAFFEINATED.setUserImage(null, "");
CAFFEINATED.setUserName("");
CAFFEINATED.setUserPlatform(null, "");

/* Koi */
koi.addEventListener("close", () => {
    CONNECTED = false;
    koi.reconnect();

    setTimeout(() => {
        if (!CONNECTED) {
            splashText("Reconnecting to Casterlabs.");
            splashScreen(true);
        }
    }, 2000);
});

koi.addEventListener("user_update", (event) => {
    splashScreen(false);
    loginScreen("SUCCESS");

    CAFFEINATED.setUserImage(event.streamer.image_link, event.streamer.username);
    CAFFEINATED.setUserName(event.streamer.username, event.streamer.badges);
    CAFFEINATED.setFollowerCount(event.streamer.followers_count);
    CAFFEINATED.setUserPlatform(event.streamer.platform, event.streamer.link);

    CAFFEINATED.userdata = event;
});

koi.addEventListener("error", (event) => {
    let error = event.error;

    switch (error) {
        case "AUTH_INVALID": {
            splashScreen(false);
            triggerLogin();
            CAFFEINATED.store.delete("token");
            CAFFEINATED.token = null;
        }
    }
});

koi.addEventListener("open", () => {
    if (!CAFFEINATED.token) {
        triggerLogin();
        splashScreen(false);
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

function kFormatter(num, decimalPlaces = 1, threshold = 1000) {
    const negative = num < 0;
    let shortened;
    let mult;

    num = Math.abs(num);

    if ((num >= threshold) && (num >= 1000)) {
        if (num >= 1000000000000) {
            shortened = "Over 1";
            mult = "t";
        } else if (num >= 1000000000) {
            shortened = (num / 1000000000).toFixed(decimalPlaces);
            mult = "b";
        } else if (num >= 1000000) {
            shortened = (num / 1000000).toFixed(decimalPlaces);
            mult = "m";
        } else if (num >= 1000) {
            shortened = (num / 1000).toFixed(decimalPlaces);
            mult = "k";
        }
    } else {
        shortened = num.toFixed(decimalPlaces);
        mult = "";
    }

    if (shortened.includes(".")) {
        shortened = shortened.replace(/\.?0+$/, '');
    }

    return (negative ? "-" : "") + shortened + mult;
}

function sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

function loginScreen(screen) {
    if (!document.querySelector("#login").classList.contains("hide")) {
        const buttons = document.querySelector("#login-buttons");
        const waiting = document.querySelector("#login-waiting");

        const loginCaffeine = document.querySelector("#login-caffeine");
        const mfaCaffeine = document.querySelector("#mfa-caffeine");

        anime({
            targets: [buttons, waiting, loginCaffeine],
            easing: "linear",
            opacity: 0,
            duration: 175
        }).finished.then(() => {
            buttons.classList.add("hide");
            waiting.classList.add("hide");
            loginCaffeine.classList.add("hide");

            if (screen === "SUCCESS") {
                anime({
                    targets: "#login",
                    easing: "linear",
                    opacity: 1,
                    duration: 175
                }).finished.then(() => {
                    document.querySelector("#login").classList.add("hide");
                });
            } else if (screen === "NONE") {
                buttons.classList.remove("hide");

                anime({
                    targets: buttons,
                    easing: "linear",
                    opacity: 1,
                    duration: 175
                });
            } else if (screen === "CAFFEINE") {
                loginCaffeine.classList.remove("hide");

                anime({
                    targets: loginCaffeine,
                    easing: "linear",
                    opacity: 1,
                    duration: 175
                });
            } else if (screen === "CAFFEINE_MFA") {
                mfaCaffeine.classList.remove("hide");

                anime({
                    targets: mfaCaffeine,
                    easing: "linear",
                    opacity: 1,
                    duration: 175
                });
            } else {
                splashScreen(false);
                waiting.classList.remove("hide");
                anime({
                    targets: waiting,
                    easing: "linear",
                    opacity: 1,
                    duration: 175
                });
            }

            if (screen === "TWITCH") {
                const auth = new AuthCallback("caffeinated_twitch");

                // 15min timeout
                auth.awaitAuthMessage((15 * 1000) * 60).then((token) => {
                    CAFFEINATED.setToken(token);
                }).catch((reason) => {
                    console.error("Could not await for token: " + reason);
                    loginScreen("NONE");
                });

                openLink("https://id.twitch.tv/oauth2/authorize?client_id=ekv4a842grsldmwrmsuhrw8an1duxt&redirect_uri=https://casterlabs.co/auth?type=caffeinated_twitch&response_type=code&scope=user:read:email chat:read chat:edit&state=" + auth.getStateString());
            }
        });
    }
}

function triggerLogin() {
    document.querySelector("#login").classList.remove("hide");
    loginScreen("NONE");
}

document.querySelector("#login-caffeine-password").addEventListener("keyup", (e) => {
    if (e.code == "Enter") {
        loginCaffeine();
    }
});

function loginCaffeine() {
    const username = document.querySelector("#login-caffeine-username");
    const password = document.querySelector("#login-caffeine-password");
    const mfa = document.querySelector("#login-caffeine-mfa");

    const loginPayload = {
        account: {
            username: username.value,
            password: password.value
        },
        mfa: {
            otp: mfa.value
        }
    }

    loginScreen("WAITING");

    fetch("https://api.caffeine.tv/v1/account/signin", {
        method: "POST",
        body: JSON.stringify(loginPayload),
        headers: new Headers({
            "Content-Type": "application/json"
        })
    }).then((result) => result.json()).then((response) => {
        if (response.hasOwnProperty("next")) {
            loginScreen("CAFFEINE_MFA");
        } else if (response.hasOwnProperty("errors")) {
            loginScreen("CAFFEINE");
        } else {
            const refreshToken = response.refresh_token;

            username.value = "";
            password.value = "";
            mfa.value = "";

            fetch("https://api.casterlabs.co/v2/platforms/caffeine/authorize?refresh_token=" + refreshToken).then((nResult) => nResult.json()).then((nResponse) => {
                if (nResponse.data) {
                    CAFFEINATED.setToken(nResponse.data.token);
                } else {
                    loginScreen("CAFFEINE");
                }
            });
        }
    }).catch(() => {
        loginScreen("CAFFEINE");
    });
}

function isPlatform(expected) {
    return CAFFEINATED.userdata.streamer.platform == expected;
}
