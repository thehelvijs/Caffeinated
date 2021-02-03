const electron = require("electron").remote;
const shell = require("electron").shell;
const dialog = electron.dialog;
const express = require("express");
const Store = require("electron-store");
const { ipcRenderer } = require("electron");
const { app, ipcMain, BrowserWindow, globalShortcut } = require("electron").remote;
const windowStateKeeper = require("electron-window-state");

const PROTOCOLVERSION = 43;
const VERSION = "1.1-stable3";

const LOGIN_BUTTONS = {
    STABLE: `
        <a class="button" onclick="UI.login('caffeinated_twitch', 'https:\/\/id.twitch.tv/oauth2/authorize?client_id=ekv4a842grsldmwrmsuhrw8an1duxt&redirect_uri=https%3A%2F%2Fcasterlabs.co/auth?type=caffeinated_twitch&response_type=code&scope=user:read:email%20chat:read%20chat:edit%20bits:read%20channel:read:subscriptions%20channel_subscriptions%20channel:read:redemptions&state=');" style="overflow: hidden; background-color: #7d2bf9;">
            <img src="https://assets.casterlabs.co/twitch/logo.png" style="height: 1.5em; position: absolute; left: 14px; top: 7.5px;" />
            <span style="padding-left: 1.75em; z-index: 2;">
                Login with Twitch
            </span>
        </a>
        <br />
        <a class="button" onclick="UI.login('caffeinated_trovo', 'https:\/\/open.trovo.live/page/login.html?client_id=BGUnwUJUSJS2wf5xJpa2QrJRU4ZVcMgS&response_type=token&scope=channel_details_self+chat_send_self+send_to_my_channel+user_details_self+chat_connect&redirect_uri=https%3A%2F%2Fcasterlabs.co/auth/trovo&state=');" style="overflow: hidden; background-color: #088942;">
            <img src="https://assets.casterlabs.co/trovo/logo.png" style="height: 2em; position: absolute; left: 8px; top: 4px;" />
            <span style="padding-left: 1.75em; z-index: 2;">
                Login with Trovo
            </span>
        </a>
        <br />
        <a class="button" onclick="UI.loginScreen('CAFFEINE');" style="overflow: hidden; background-color: #0000FF;">
            <img src="https://assets.casterlabs.co/caffeine/logo.png" style="height: 2.5em; position: absolute; left: 5px;" />
            <span style="padding-left: 1.75em; z-index: 2;">
                Login with Caffeine
            </span>
        </a>
    `
};

const koi = new Koi("wss://api.casterlabs.co/v2/koi");

let CONNECTED = false;
let PLATFORM_DATA = {};

console.log("%c0", `
    line-height: 105px;
    background-image: url("https://assets.casterlabs.co/logo/casterlabs_full_white.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #141414;
    border-radius: 15px;
    margin-left: calc((50% - 150px) - 1ch);
    padding-left: 150px;
    color: transparent;
    padding-right: 150px;
`);

console.log(`%c
Caution, here be dragons!
If someone tells you to paste code here, they might be trying to steal important data from you.



`, "font - size: 18px;");

console.log("\n\n");

class Caffeinated {
    constructor() {
        FONTSELECT.endPoint = "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyBuFeOYplWvsOlgbPeW8OfPUejzzzTCITM"; // TODO cache/proxy from Casterlabs' server

        this.uniqueStateId = btoa(generateUUID() + generateUnsafePassword());
        this.store = new Store();

        if (!this.store.get("initalized")) {
            this.store.set({
                initalized: true,
                port: 8091,
                token: null,
                modules: {},
                cleared: []
            });
        }

        if (!this.store.has("cleared_events")) {
            this.store.set("cleared_events", []);
        }

        if (!this.store.has("resource_tokens")) {
            this.store.set("resource_tokens", {});
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

        document.querySelector("#login-buttons .button-container").innerHTML =
            (
                ((this.store.get("channel") == "STABLE") && !this.isDevEnviroment) || !LOGIN_BUTTONS.BETA
            ) ?
                LOGIN_BUTTONS.STABLE :
                LOGIN_BUTTONS.BETA;
    }

    async addRepo(repo) {
        if (repo.endsWith("/")) {
            repo = repo.substring(repo, repo.length - 1);
        }

        await this.repomanager.addRepo(repo);

        this.store.set("repos", [repo]);

        location.reload();
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

    getResourceToken(resourceId) {
        return this.store.get("resource_tokens")[resourceId];
    }

    addResourceToken(token) {
        try {
            let payload = JSON.parse(atob(token.split(".")[1]));
            let tokens = this.store.get("resource_tokens");

            payload.token = token;

            fetch(`https://${payload.server_location}/data?token=${token}`).then((response) => {
                if (response.status == 200) {
                    tokens[payload.resource_id] = payload;

                    this.store.set("resource_tokens", tokens);

                    response.json().then(async (result) => {
                        try {
                            await this.repomanager.addRepo(result.data.module_url);
                        } catch (e) {
                            console.error(e);
                        }
                    });

                    alert("Code redeemed successfully.");
                } else {
                    alert("Code invalid.");
                }
            }).catch(() => {
                alert("Code invalid.");
            });
        } catch (e) {
            alert("Code invalid.");
        }
    }

    removeResourceToken(resourceId) {
        let tokens = this.store.get("resource_tokens");

        delete tokens[resourceId];

        this.store.set("resource_tokens", tokens);

        location.reload();
    }

    reset() {
        this.store.clear();
        location.reload();
    }

    async init() {
        FONTSELECT.preload();

        setInterval(() => this.checkForUpdates(), (5 * 60) * 1000); // 5 Minutes

        PLATFORM_DATA = await (await fetch("https://api.casterlabs.co/v2/koi/platforms")).json();

        const LANGUAGE_MAP = {
            "English": "en-*",
            "Français": "fr-*"
        };

        MODULES.initalizeModule({
            displayname: "caffeinated.settings.title",
            namespace: "casterlabs_caffeinated_settings",
            type: "settings",
            persist: true,
            id: "settings",

            getDataToStore() {
                return this.settings;
            },

            settingsDisplay: {
                signout: {
                    display: "caffeinated.settings.signout",
                    type: "button",
                    isLang: true
                },
                language: {
                    display: "caffeinated.settings.language",
                    type: "select",
                    isLang: true
                }
            },

            onSettingsUpdate() {
                CAFFEINATED.setLanguage(LANGUAGE_MAP[this.settings.language]);
            },

            defaultSettings: {
                signout: () => {
                    CAFFEINATED.signOut();
                },
                language: Object.keys(LANGUAGE_MAP)
            }
        });

        await this.repomanager.addRepo(__dirname + "/modules");

        MODULES.initalizeModule({
            namespace: "casterlabs_caffeinated_modules",
            type: "settings",
            persist: true,
            id: "third_party_modules",

            getDataToStore() {
                return this.settings;
            },

            async init() {
                if (CAFFEINATED.store.has("repos")) {
                    CAFFEINATED.store.get("repos").forEach((url) => {
                        this.settings.third_party_repos.push({ repo_url: url });
                    });
                    MODULES.saveToStore(this);
                    CAFFEINATED.store.delete("repos");
                    location.reload();
                }

                for (const repo of this.settings.third_party_repos) {
                    try {
                        await CAFFEINATED.repomanager.addRepo(repo.repo_url);
                    } catch (e) {
                        console.error(e);
                    }
                }
            },

            settingsDisplay: {
                third_party_repos: "dynamic",
                apply: {
                    display: "Apply (Requires Reload)",
                    type: "button",
                    isLang: false
                }
            },

            defaultSettings: {
                third_party_repos: {
                    display: {
                        repo_url: {
                            display: "Repo URL",
                            type: "input",
                            isLang: false
                        }
                    },
                    default: {
                        repo_url: ""
                    }
                },
                apply: () => {
                    location.reload();
                }
            }
        });

        for (const payload of Object.values(this.store.get("resource_tokens"))) {
            const response = await fetch(`https://${payload.server_location}/data?token=${payload.token}`)

            if (response.status == 200) {
                const result = await response.json();
                try {
                    await this.repomanager.addRepo(result.data.module_url);
                } catch (e) {
                    console.error(e);
                }
            } else {
                this.removeResourceToken(payload.token);
            }
        }

        for (const [namespace, modules] of Object.entries(this.store.get("modules"))) {
            for (const id of Object.keys(modules)) {
                try {
                    const loaded = MODULES.getFromUUID(namespace + ":" + id);

                    if (!loaded) {
                        MODULES.initalizeModule(new MODULES.moduleClasses[namespace](id));
                    }
                } catch (e) {
                    console.info(`Removed unloaded module "${namespace}:${id}" from config.`)
                    this.store.delete(`modules.${namespace}.${id}`);
                } // Delete values, module is not present.
            }
        }

        MODULES.initalizeModule({
            namespace: "casterlabs_caffeinated_redeem",
            type: "settings",
            persist: true,
            id: "resource_redeem",

            onSettingsUpdate() {
                this.page.querySelector('[name="code_to_redeem"]').value = "";

                CAFFEINATED.addResourceToken(this.settings.code_to_redeem);
            },

            settingsDisplay: {
                code_to_redeem: "input"
            },

            defaultSettings: {
                code_to_redeem: ""
            }
        });

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
                    height: "475px",
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

    setLanguage(language) {
        this.store.set("language", language);

        LANG.translate(document);
        // UI.setFollowerCount(this.userdata.streamer.followers_count);
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
    slapCounter: 0,
    dootCounter: 0,
    doots: [],
    dootSize: 35,
    dootCanvas: document.querySelector("#doot-rain"),
    dootImg: new Image(),

    init() {
        this.dootCtx = this.dootCanvas.getContext("2d");
        this.dootImg.src = "https://assets.casterlabs.co/doot/doot.png";

        for (let i = 0; i != 250; i++) {
            const scale = (Math.random() * (1 - 0.8)) + 0.8;

            this.doots.push({
                x: Math.random(),
                y: Math.random(),
                ys: Math.random() + 1,
                scale: scale
            });
        }
    },

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
            document.querySelector(".user-platform").src = PLATFORM_DATA[platform].logo;
            document.querySelector(".user-platform").setAttribute("title", link);
        } else {
            document.querySelector(".user-platform").src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
            document.querySelector(".user-platform").setAttribute("title", "");
        }
    },

    slap() {
        if (this.slapCounter >= 0) {
            this.slapCounter++;

            if (this.slapCounter == 5) {
                this.slapCounter = -1;
                const audio = new Audio("https://assets.casterlabs.co/doot/cut.mp3");

                audio.addEventListener("play", () => {
                    setTimeout(() => {
                        const html = document.body.parentElement;

                        html.style.filter = "invert(1)";

                        setTimeout(() => {
                            anime({
                                easing: "linear",
                                duration: 1000,
                                direction: "reverse",
                                update: (anim) => {
                                    html.style.filter = `invert(${anim.progress / 100})`;
                                }
                            }).finished.then(() => {
                                html.style.filter = "";
                                this.slapCounter = 0;
                            });
                        }, 7500);
                    }, 1575);
                });

                audio.volume = 0.25;
                audio.play();
            } else {
                setTimeout(() => {
                    this.slapCounter--;
                }, 10000);
            }
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

    /*setFollowerCount(count) {
        if (count && (count >= 0)) {
            const formatted = kFormatter(count, 1);

            document.querySelector("#followers").innerText = LANG.getTranslation("caffeinated.internal.followers_count_text", formatted);

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
    },*/

    reset() {
        // this.setFollowerCount(null);
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
            });
        }
    },

    drawDoots(force) {
        if ((this.dootCanvas.style.opacity > 0) || force) {
            const start = performance.now();

            const width = window.innerWidth;
            const height = window.innerHeight;

            this.dootCanvas.width = width;
            this.dootCanvas.height = height;

            if (this.doots.length > 0) {
                this.dootCtx.clearRect(0, 0, width, height);

                this.doots.forEach((dootItem) => {
                    dootItem.y += dootItem.ys / height;

                    if (dootItem.y > ((this.dootSize / height) + 1)) {
                        dootItem.x = Math.random();
                        dootItem.y = 0;
                    }

                    this.dootCtx.drawImage(this.dootImg, dootItem.x * width, (dootItem.y * height) - this.dootSize, this.dootSize, this.dootSize);
                });
            }

            const time = performance.now() - start;

            setTimeout(() => this.drawDoots(), (1000 / 60) - time);
        }
    },

    doot() {
        if (this.dootCounter >= 0) {
            this.dootCounter++;

            const bigDoot = this.dootCounter == 20;

            const audio = new Audio(
                bigDoot ?
                    "https://assets.casterlabs.co/doot/2.mp3" :
                    "https://assets.casterlabs.co/doot/1.mp3");

            if (bigDoot) {
                this.dootCounter = -1;

                audio.addEventListener("ended", () => {
                    anime({
                        targets: this.dootCanvas,
                        easing: "linear",
                        opacity: 0,
                        duration: 750
                    }).finished.then(() => {
                        this.dootCounter = 0;
                    });
                });

                audio.addEventListener("play", () => {
                    setTimeout(() => {
                        this.dootCanvas.style.opacity = 0.001;

                        anime({
                            targets: this.dootCanvas,
                            easing: "linear",
                            opacity: 1,
                            duration: 750
                        });

                        this.drawDoots(true);
                    }, 17680);
                });
            } else {
                setTimeout(() => {
                    this.dootCounter--;
                }, 10000);
            }

            audio.volume = 0.1;
            audio.play();
        }
    },

    login(platform, link) {
        this.loginScreen("LOGIN_AWAIT");

        const auth = new AuthCallback(platform);

        // 15min timeout
        auth.awaitAuthMessage((15 * 1000) * 60).then((token) => {
            CAFFEINATED.setToken(token);
        }).catch((reason) => {
            console.error("Could not await for token: " + reason);
            this.loginScreen("NONE");
        });

        openLink(link + auth.getStateString());
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

                fetch("https://api.casterlabs.co/v2/natsukashii/create?platform=CAFFEINE&token=" + refreshToken).then((nResult) => nResult.json()).then((nResponse) => {
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
        if (show) {
            document.querySelector("#splash").classList.remove("hide");
        } else {
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
        }).finished.then(() => {
            if (!show) {
                document.querySelector("#splash").classList.add("hide");
            }
        });
    }

};

UI.init();
UI.reset();

LANG.translate(document.querySelector(".menu-button-title"));

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
    UI.setUserImage(event.streamer.image_link, event.streamer.displayname);
    UI.setUserName(event.streamer.displayname, event.streamer.badges);
    // UI.setFollowerCount(event.streamer.followers_count);
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
    app.exit();
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

setTimeout(() => {
    CAFFEINATED.triggerBanner("discord-banner", (element) => {
        element.innerHTML = `
            <a style="margin-left: 5px; color: white; text-decoration: underline;" onclick="openLink('https:\/\/casterlabs.co/discord');">
                We have a Discord server!
            </a>
        `;
    }, "#7289da");
}, (5 * 60) * 1000);
