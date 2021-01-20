const electron = require("electron").remote;
const shell = require("electron").shell;
const dialog = electron.dialog;
const express = require("express");
const Store = require("electron-store");
const { ipcRenderer } = require("electron");
const { app, ipcMain, BrowserWindow, globalShortcut } = require("electron").remote;
const windowStateKeeper = require("electron-window-state");

const PROTOCOLVERSION = 26;
const VERSION = "1.0-stable3";

const koi = new Koi("wss://api.casterlabs.co/v2/koi");

let CONNECTED = false;
let PLATFORMS = {};

console.log("%c                                                 ", `
    line-height:      100px;
    background-image: url("https://assets.casterlabs.co/logo/casterlabs_full_white.png");
    background-size:  cover;
`);

console.log(`%c
Caution, here be dragons!
If someone tells you to paste code here, they might be trying to steal important data from you.



Check out our skinning guide! https://github.com/thehelvijs/Caffeinated/wiki/Skinning-Guide`, "font - size: 18px;");

console.log("\n\n");

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
        }

        if (!this.store.has("cleared_events")) {
            this.store.set("cleared_events", []);
        }

        this.isDevEnviroment = !location.href.includes(".asar") || this.store.get("force_dev");

        if (this.isDevEnviroment) {
            this.store.set("cleared_events", []);
            this.store.set("protocol_version", -1);

            this.triggerBanner("dev", (element) => {
                element.innerHTML = "DEVELOPER MODE";
            }, "rebeccapurple");
        } else {
            this.store.set("version", VERSION);
            this.store.set("protocol_version", PROTOCOLVERSION);
        }

        this.repomanager = new RepoManager();

        this.token = this.store.get("token");
        this.userdata = null;
        this.notifiedUpdate = false;

    }

    async addRepo(repo) {
        repo = repo.replace("\\", "/");

        if (repo.endsWith("/")) {
            repo = repo.substring(repo, repo.length - 1);
        }

        await this.repomanager.addRepo(repo);

        this.store.set("repos", this.store.get("repos").concat(repo));
    }

    triggerBanner(name, callback, color = "rebeccapurple") {
        if (!this.store.get("cleared_events").includes(name)) {
            const banner = document.createElement("div");
            const content = document.createElement("div");
            const dismiss = document.createElement("a");

            dismiss.innerHTML = `<ion-icon name="close-sharp"></ion-icon>`;
            dismiss.classList = "banner-close";
            dismiss.addEventListener("click", () => {
                banner.remove();
                this.store.set("cleared_events", this.store.get("cleared_events").concat(name));
            });

            banner.classList = "banner";
            banner.style.backgroundColor = color;
            banner.appendChild(content);
            banner.appendChild(dismiss);

            document.querySelector("#banners").appendChild(banner);

            callback(content);
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
        FONTSELECT.preload();

        setInterval(() => this.checkForUpdates(), (10 * 60) * 1000); // 10 Minutes

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
                    CAFFEINATED.signOut();
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

        MODULES.initalizeModule({
            displayname: "caffeinated.credits.title",
            namespace: "casterlabs_credits",
            type: "settings",
            persist: true,
            id: "credits",

            onFrameLoad(frame) {
                frame.contentWindow.openLink = openLink;
            },

            settingsDisplay: {
                content: {
                    type: "iframe-src",
                    height: "400px",
                    isLang: false
                }
            },

            defaultSettings: {
                content: __dirname + "/credits.html"
            }
        });

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

    forceDevEnviroment(value) {
        this.store.set("force_dev", value);

        location.reload();
    }

    setChannel(value) {
        this.store.set("channel", value);

        this.checkForUpdates();
    }

    getChannel() {
        return this.store.get("channel");
    }

    async checkForUpdates(force = false) {
        const LAUNCHER_VERSION = this.store.get("launcher_version");
        const CHANNEL = this.store.get("channel");

        const updates = await (await fetch("https://api.casterlabs.co/v1/caffeinated/updates")).json();
        const launcher = updates["launcher-" + LAUNCHER_VERSION];
        const channel = launcher[CHANNEL];

        if (channel) {
            if (!this.isDevEnviroment && !this.notifiedUpdate) {
                const latestProtocol = channel.protocol_version

                if ((PROTOCOLVERSION < latestProtocol) || force) {
                    this.notifiedUpdate = true;
                    // An update is available
                    this.triggerBanner("protocol-update-" + latestProtocol, (element) => {
                        element.innerHTML = `
                            <span>
                                An update is available.
                            </span>
                            <a style="margin-left: 5px; color: white; text-decoration: underline;" onclick="app.relaunch(); app.exit();">
                                Restart
                            </a>
                        `;
                    }, "#06d6a0");
                }
            }
        } else {
            this.store.set("channel", "STABLE");
            console.warn("Changed update channel to STABLE as the previous one was invalid.")
        }
    }

    setToken(token) {
        if (token) {
            this.token = token;
            CAFFEINATED.store.set("token", this.token);

            UI.reset();
            UI.loginScreen("SUCCESS");

            koi.reconnect();
        } else {
            this.signOut();
        }
    }

    signOut() {
        const token = this.token;
        this.token = null;

        koi.reconnect();
        CAFFEINATED.store.delete("token");

        fetch("https://api.casterlabs.co/v2/natsukashii/revoke", {
            headers: new Headers({
                authorization: "Bearer " + token
            })
        });
    }

}

const CAFFEINATED = new Caffeinated();
const MODULES = new Modules();
const UI = {

    setUserName(username, badges) {
        const element = document.querySelector(".user-username");

        element.innerHTML = '<ion-icon name="settings-outline"></ion-icon>&nbsp;&nbsp;&nbsp;&nbsp;';

        if (username) {
            element.innerHTML += "&nbsp;&nbsp;" + escapeHtml(username);

            badges.forEach((badge) => {
                element.innerHTML += `<img style="height: 1.1em; transform: translateY(.2em); padding-left: 3px;" src=${badge} />`;
            })
        }
    },

    setUserPlatform(platform, link) {
        if (platform) {
            document.querySelector(".user-platform").src = PLATFORMS[platform].logo;
            document.querySelector(".user-platform").setAttribute("title", link);
        } else {
            document.querySelector(".user-platform").src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
            document.querySelector(".user-platform").setAttribute("title", "");
        }
    },

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
    },

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
    },

    reset() {
        this.setFollowerCount(null);
        this.setUserImage(null, "");
        this.setUserName("");
        this.setUserPlatform(null, "");
    },

    loginScreen(screen) {
        if (!document.querySelector("#login").classList.contains("hide")) {
            const buttons = document.querySelector("#login-buttons");
            const waiting = document.querySelector("#login-waiting");
            const success = document.querySelector("#login-success");

            const loginCaffeine = document.querySelector("#login-caffeine");
            const mfaCaffeine = document.querySelector("#mfa-caffeine");

            anime({
                targets: [buttons, waiting, success, loginCaffeine, mfaCaffeine],
                easing: "linear",
                opacity: 0,
                duration: 175
            }).finished.then(() => {
                buttons.classList.add("hide");
                waiting.classList.add("hide");
                success.classList.add("hide");
                loginCaffeine.classList.add("hide");

                if (screen === "SUCCESS") {
                    success.classList.remove("hide");
                    anime({
                        targets: success,
                        easing: "linear",
                        opacity: 1,
                        duration: 175
                    });
                } else if (screen === "HIDE") {
                    anime({
                        targets: "#login",
                        easing: "linear",
                        opacity: 0,
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
                    UI.splashScreen(false);
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
                        this.loginScreen("NONE");
                    });

                    openLink("https://id.twitch.tv/oauth2/authorize?client_id=ekv4a842grsldmwrmsuhrw8an1duxt&redirect_uri=https://casterlabs.co/auth?type=caffeinated_twitch&response_type=code&scope=user:read:email chat:read chat:edit&state=" + auth.getStateString());
                }
            });
        }
    },

    triggerLogin() {
        document.querySelector("#login").classList.remove("hide");
        anime({
            targets: "#login",
            easing: "linear",
            opacity: 1,
            duration: 175
        }).finished.then(() => {
            this.reset();
        });
        this.loginScreen("NONE");
    },

    loginCaffeine() {
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

        this.loginScreen("WAITING");

        fetch("https://api.caffeine.tv/v1/account/signin", {
            method: "POST",
            body: JSON.stringify(loginPayload),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        }).then((result) => result.json()).then((response) => {
            if (response.hasOwnProperty("next")) {
                this.loginScreen("CAFFEINE_MFA");
            } else if (response.hasOwnProperty("errors")) {
                this.loginScreen("CAFFEINE");
            } else {
                const refreshToken = response.refresh_token;

                username.value = "";
                password.value = "";
                mfa.value = "";

                fetch("https://api.casterlabs.co/v2/platforms/caffeine/authorize?refresh_token=" + refreshToken).then((nResult) => nResult.json()).then((nResponse) => {
                    if (nResponse.data) {
                        CAFFEINATED.setToken(nResponse.data.token);
                    } else {
                        this.loginScreen("CAFFEINE");
                    }
                });
            }
        }).catch(() => {
            this.loginScreen("CAFFEINE");
        });
    },

    splashText(text) {
        anime({
            targets: ".splash-message",
            easing: "linear",
            opacity: 0,
            duration: 500
        }).finished.then(() => {
            if (text != null) {
                document.querySelector(".splash-message").innerHTML = text;

                anime({
                    targets: ".splash-message",
                    easing: "linear",
                    opacity: 1,
                    duration: 500
                });
            }
        });
    },

    splashScreen(show) {
        if (!show) {
            document.querySelector("#content").classList.remove("hide");
        }

        anime({
            targets: "#content",
            easing: "linear",
            opacity: show ? 0 : 1,
            duration: 500
        }).finished.then(() => {
            if (show) {
                document.querySelector("#content").classList.add("hide");
            }
        });

        anime({
            targets: "#splash",
            easing: "linear",
            opacity: show ? 1 : 0,
            duration: 500
        });
    }

};

UI.reset();

function isPlatform(expected) {
    if (CAFFEINATED.userdata) {
        return CAFFEINATED.userdata.streamer.platform == expected;
    } else {
        return false;
    }
}

/* Koi */
koi.addEventListener("close", () => {
    CONNECTED = false;
    koi.reconnect();

    setTimeout(() => {
        if (!CONNECTED) {
            UI.splashText("Reconnecting to Casterlabs.");
            UI.splashScreen(true);
        }
    }, 2000);
});

koi.addEventListener("chat", (event) => {
    // Only trusted Casterlabs "staff" have this badge.
    if (event.sender.badges.includes("https://assets.casterlabs.co/crown.png")) {
        const message = event.message.toLowerCase();

        if (message === "!debug reconnect") {
            koi.sendMessage(`@${event.sender.username} [CAFFEINATED DEBUG]\nReconnecting.`);
            UI.splashText("Reconnecting to Casterlabs.");
            UI.splashScreen(true);
            koi.close();
        } else if (message === "!debug update") {
            koi.sendMessage(`@${event.sender.username} [CAFFEINATED DEBUG]\nForcing update.`);
            CAFFEINATED.store.set("protocol_version", -1);
            app.relaunch();
            app.exit();
        } else if (message.startsWith("!debug")) {
            koi.sendMessage(
                `[CAFFEINATED DEBUG]\nv: ${VERSION}\npv: ${PROTOCOLVERSION}\n\nts: ${Date.now()}`
            );
        }
    }
});

koi.addEventListener("user_update", (event) => {
    UI.splashScreen(false);
    UI.loginScreen("HIDE");
    UI.setUserImage(event.streamer.image_link, event.streamer.username);
    UI.setUserName(event.streamer.username, event.streamer.badges);
    UI.setFollowerCount(event.streamer.followers_count);
    UI.setUserPlatform(event.streamer.platform, event.streamer.link);

    CAFFEINATED.userdata = event;
});

koi.addEventListener("error", (event) => {
    let error = event.error;

    switch (error) {
        case "AUTH_INVALID": {
            UI.splashScreen(false);
            UI.triggerLogin();

            CAFFEINATED.store.delete("token");
            CAFFEINATED.token = null;
        }
    }
});

koi.addEventListener("open", () => {
    if (!CAFFEINATED.token) {
        UI.triggerLogin();
        UI.splashScreen(false);
    }

    CONNECTED = true;
    UI.splashText(null);
});

/* UI */
Array.from(document.querySelectorAll(".menu-button")).forEach((dropdown) => {
    dropdown.addEventListener("click", () => {
        const dropdownContent = dropdown.nextElementSibling;

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

document.querySelector("#login-caffeine-password").addEventListener("keyup", (e) => {
    if (e.code == "Enter") {
        UI.loginCaffeine();
    }
});

document.querySelector("#login-caffeine-mfa").addEventListener("keyup", (e) => {
    if (e.code == "Enter") {
        UI.loginCaffeine();
    }
});
