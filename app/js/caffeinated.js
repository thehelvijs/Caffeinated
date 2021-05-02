const electron = require("electron").remote;
const shell = require("electron").shell;
const dialog = electron.dialog;
const express = require("express");
const Store = require("electron-store");
const { ipcRenderer } = require("electron");
const { app, ipcMain, BrowserWindow, globalShortcut } = require("electron").remote;
const windowStateKeeper = require("electron-window-state");
const RPC = require("discord-rpc");

const PROTOCOLVERSION = 72;
const VERSION = "1.1-stable32";
const CLIENT_ID = "LmHG2ux992BxqQ7w9RJrfhkW";
const BROWSERWINDOW = electron.getCurrentWindow();

const discordRPCClient = new RPC.Client({
    transport: "ipc"
});

discordRPCClient.login({
    clientId: "829844402548768768",
    clientSecret: "3d829b1a030e39dcf354edda0e0777e6a15a0993d0dfb4b2193f6cc2b19481e0"
});

/*
    All experimental flags:

     - experimental.no_translation_default   (default: false)
     - experimental.manage_widgets           (default: false)
     - experimental.use_beta_koi_path        (default: false)

*/

const LOGIN_BUTTONS = {
    STABLE: `
        <a class="button" onclick="LOGIN_CALLBACKS.twitch();" style="overflow: hidden; background-color: #7d2bf9;">
            <img src="https://assets.casterlabs.co/twitch/logo.png" style="height: 1.5em; position: absolute; left: 14px; top: 7.5px;" />
            <span style="position: absolute; left: 3em; z-index: 2;">
                Login with Twitch
            </span>
        </a>
        <br />
        <a class="button" onclick="LOGIN_CALLBACKS.trovo();" style="overflow: hidden; background-color: #088942;">
            <img src="https://assets.casterlabs.co/trovo/logo.png" style="height: 2em; position: absolute; left: 8px; top: 4px;" />
            <span style="position: absolute; left: 3em; z-index: 2;">
                Login with Trovo
            </span>
        </a>
        <br />
        <a class="button" onclick="LOGIN_CALLBACKS.caffeine();" style="overflow: hidden; background-color: #0000FF;">
            <img src="https://assets.casterlabs.co/caffeine/logo.png" style="height: 2.5em; position: absolute; left: 5px;" />
            <span style="position: absolute; left: 3em; z-index: 2;">
                Login with Caffeine
            </span>
        </a>
        <br />
        <a class="button" onclick="LOGIN_CALLBACKS.glimesh();" style="overflow: hidden; background-color: #0e1726;">
            <img src="https://assets.casterlabs.co/glimesh/logo.png" style="height: 1.65em; position: absolute; left: 11px;" />
            <span style="position: absolute; left: 3em; z-index: 2;">
                Login with Glimesh
            </span>
        </a>
        <br />
        <a class="button" onclick="LOGIN_CALLBACKS.brime();" style="background: linear-gradient(45deg, #8439af 15%, #fc3537 65%);">
            <img src="https://assets.casterlabs.co/brime/white.png" style="height: 2.5em; position: absolute; left: 4px;" />
            <span style="position: absolute; left: 3em; z-index: 2;">
                Login with Brime
            </span>
        </a>
    `
};
const LOGIN_CALLBACKS = {
    twitch(backCallback) {
        UI.setBackCallback(backCallback);
        UI.login("caffeinated_twitch", "https://id.twitch.tv/oauth2/authorize?client_id=ekv4a842grsldmwrmsuhrw8an1duxt&force_verify=true&redirect_uri=https%3A%2F%2Fcasterlabs.co/auth?type=caffeinated_twitch&response_type=code&scope=user:read:email%20chat:read%20chat:edit%20bits:read%20channel:read:subscriptions%20channel_subscriptions%20channel:read:redemptions&state=");
    },
    trovo(backCallback) {
        UI.setBackCallback(backCallback);
        UI.login("caffeinated_trovo", "https://open.trovo.live/page/login.html?client_id=BGUnwUJUSJS2wf5xJpa2QrJRU4ZVcMgS&response_type=token&scope=channel_details_self+chat_send_self+send_to_my_channel+user_details_self+chat_connect&redirect_uri=https%3A%2F%2Fcasterlabs.co/auth/trovo&state=");
    },
    caffeine(backCallback) {
        UI.setBackCallback(backCallback);
        UI.loginScreen("CAFFEINE");
    },
    glimesh(backCallback) {
        UI.setBackCallback(backCallback);
        UI.login("caffeinated_glimesh", "https://glimesh.tv/oauth/authorize?force_verify=true&client_id=3c60c5b45bbae0eadfeeb35d1ee0c77e580b31fd42a5fbc8ae965ca7106c5139&redirect_uri=https%3A%2F%2Fcasterlabs.co%2Fauth%2Fglimesh&response_type=code&scope=public+email+chat&state=");
    },
    brime(backCallback) {
        UI.setBackCallback(backCallback);
        UI.loginScreen("BRIME");
    }
}

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
        this.uniqueStateId = generateUnsafeUniquePassword(64);
        this.store = new Store();

        if (!this.store.get("initalized")) {
            this.store.set({
                initalized: true,
                port: 8091,
                token: null,
                puppet_token: null,
                modules: {},
                cleared_events: []
            });
        }

        if (!this.store.has("server_domain")) {
            this.store.set("server_domain", "api.casterlabs.co");
        }

        if (!this.store.has("enable_discord_presence")) {
            this.store.set("enable_discord_presence", true);
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
        this.puppetToken = this.store.get("puppet_token");
        this.userdata = null;
        this.streamdata = null;
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

            Array.from(content.querySelectorAll("a")).forEach((a) => {
                if (a.href) {
                    const link = a.href;

                    a.href = "#";

                    a.onclick = () => {
                        openLink(link);
                    }
                }
            });
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
        await FONTSELECT.preload();

        setInterval(() => this.checkForUpdates(), (5 * 60) * 1000); // 5 Minutes

        PLATFORM_DATA = await (await fetch(`https://${CAFFEINATED.store.get("server_domain")}/v2/koi/platforms`)).json();

        MODULES.createContentFrame(document.querySelector("#changelog"), "https://api.casterlabs.co/v1/caffeinated/changelog").then((frame) => {
            // Map the openLink function to ours.
            frame.contentWindow.openLink = openLink;
        });

        if (!this.store.get("cleared_events").includes(`${PROTOCOLVERSION}-changelog`)) {
            this.store.set("cleared_events", this.store.get("cleared_events").concat(`${PROTOCOLVERSION}-changelog`));

            document.querySelector("#changelog").classList = "";
        }

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
                view_changelog: {
                    display: "caffeinated.settings.view_changelog",
                    type: "button",
                    isLang: true
                },
                chatbot_login: {
                    display: "caffeinated.settings.chatbot_login",
                    type: "button",
                    isLang: true
                },
                language: {
                    display: "caffeinated.settings.language",
                    type: "select",
                    isLang: true
                },
                enable_discord_integration: {
                    display: "caffeinated.settings.enable_discord_integration",
                    type: "checkbox",
                    isLang: true
                },
                signout: {
                    display: "caffeinated.settings.signout",
                    type: "button",
                    isLang: true
                }
            },

            onSettingsUpdate() {
                CAFFEINATED.setLanguage(LANG.supportedLanguages[this.settings.language]);

                CAFFEINATED.store.set("enable_discord_presence", this.settings.enable_discord_integration);
                DiscordRPC.set();
            },

            init() {
                this.puppetLoginElement = document.querySelector("#casterlabs_caffeinated_settings_settings").querySelector("[name=chatbot_login]");

                this.updatePuppetElement();

                koi.addEventListener("error", (event) => {
                    let error = event.error;

                    switch (error) {
                        case "PUPPET_AUTH_INVALID": {
                            instance.updatePuppetElement(false);
                        }
                    }
                });

            },

            updatePuppetElement(valid = CAFFEINATED.puppetToken) {
                if (valid) {
                    this.puppetLoginElement.setAttribute("lang", "caffeinated.settings.chatbot_logout");
                } else {
                    this.puppetLoginElement.setAttribute("lang", "caffeinated.settings.chatbot_login");
                }

                LANG.translate(this.puppetLoginElement.parentElement);
            },

            defaultSettings: {
                chatbot_login: (instance) => {
                    if (CAFFEINATED.puppetToken) {
                        CAFFEINATED.setPuppetToken(null);
                        instance.updatePuppetElement(false);
                    } else {
                        const platform = CAFFEINATED.userdata.streamer.platform.toLowerCase();

                        UI.loginPuppet();

                        setTimeout(() => {
                            instance.updatePuppetElement(true);

                            LOGIN_CALLBACKS[platform](() => {
                                instance.updatePuppetElement(false);
                                UI.loginScreen("HIDE");
                            });
                        }, 500);
                    }
                },
                enable_discord_integration: true,
                signout: () => {
                    CAFFEINATED.signOut();
                },
                view_changelog: () => {
                    document.querySelector("#changelog").classList = "";
                },
                language: Object.keys(LANG.supportedLanguages)
            }
        });

        await this.repomanager.addRepo(__dirname + "/modules");

        await MODULES.initalizeModule({
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

                    CAFFEINATED.store.delete("repos");
                }

                for (const repo of this.settings.third_party_repos) {
                    try {
                        await CAFFEINATED.repomanager.addRepo(repo.repo_url);
                    } catch (e) {
                        console.error(e);
                    }
                }

                MODULES.saveToStore(this);
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
                    MODULES.saveToStore(this);
                    location.reload();
                }
            }
        });

        for (const payload of Object.values(this.store.get("resource_tokens"))) {
            try {
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
            } catch (e) {
                alert("Unable to connect to resource server, some resources will not be available.");
            }
        }

        for (const [namespace, modules] of Object.entries(this.store.get("modules"))) {
            for (const id of Object.keys(modules)) {
                try {
                    const loaded = MODULES.getFromUUID(namespace + ":" + id);

                    if (!loaded) {
                        const clazz = MODULES.moduleClasses[namespace] ?? MODULES.uniqueModuleClasses[namespace];
                        const module = new clazz(id);

                        MODULES.initalizeModule(module);
                    }
                } catch (e) {
                    console.info(`Removed unloaded module namespace "${namespace}" from config.`)
                    this.store.delete(`modules.${namespace}`);
                } // Delete values, module is not present.
            }
        }

        await MODULES.initalizeModule({
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
                const holder = MODULES.getHolderFromUUID(uuid);

                if (holder) {
                    const module = holder.getInstance();

                    console.debug(`Widget connected: ${uuid}`);

                    holder.sockets.push(socket);

                    socket.on("disconnect", () => {
                        console.debug(`Widget disconnected: ${uuid}`);

                        removeFromArray(holder.sockets, socket);
                    });

                    if (module.onConnection) {
                        module.onConnection(socket);
                    }
                }
            });

            socket.on("dock-uuid", (dockInfo) => {
                const { uuid, type } = dockInfo;
                const holder = MODULES.getHolderFromUUID(uuid);

                if (holder) {
                    const module = holder.getInstance();

                    console.debug(`Dock connected: ${uuid} (${type})`);

                    holder.dockSockets.push(socket);

                    socket.on("disconnect", () => {
                        console.debug(`Dock disconnected: ${uuid} (${type})`);

                        removeFromArray(holder.dockSockets, socket);
                    });

                    if (module.onDockConnection) {
                        module.onDockConnection(socket, type);
                    }
                }
            });

            socket.emit("init");
        });

        server.listen(this.store.get("port"));

        UI.regenerateWidgetManager();

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

        ANALYTICS.logUserUpdate();

        LANG.translate(document);
    }

    getChannel() {
        return this.store.get("channel");
    }

    getTimeLiveInMilliseconds() {
        if (this.streamdata.is_live) {
            return new Date().getTime() - new Date(this.streamdata.start_time).getTime();
        } else {
            return 0;
        }
    }

    async checkForUpdates(force = false) {
        if (!this.isDevEnviroment) {
            const LAUNCHER_VERSION = this.store.get("launcher_version");
            const CHANNEL = this.store.get("channel");

            const updates = await (await fetch(`https://${CAFFEINATED.store.get("server_domain")}/v1/caffeinated/updates`)).json();
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
                alert("Changed update channel to STABLE as the previous one was invalid.");
                console.warn("Changed update channel to STABLE as the previous one was invalid.");
            }
        }
    }

    setToken(token) {
        if (token) {
            this.token = token;
            this.store.set("token", this.token);

            UI.reset();
            UI.loginScreen("SUCCESS");

            koi.reconnect();
        } else {
            this.signOut();
        }
    }

    setPuppetToken(puppetToken) {
        if (puppetToken) {
            ANALYTICS.logPuppetSignin();
        } else {
            ANALYTICS.logPuppetSignout();
        }

        this.puppetToken = puppetToken;
        this.store.set("puppet_token", this.puppetToken);

        koi.ws.send(JSON.stringify({
            type: "PUPPET_LOGIN",
            token: this.puppetToken
        }));

        UI.loginScreen("HIDE");
    }

    signOut() {
        ANALYTICS.logSignout();

        UI.authCallback = (token) => this.setToken(token);

        const token = this.token;
        this.token = null;

        koi.reconnect();
        CAFFEINATED.store.delete("token");

        fetch(`https://${CAFFEINATED.store.get("server_domain")}/v2/natsukashii/revoke`, {
            headers: new Headers({
                authorization: "Bearer " + token
            })
        });
    }

}

const DiscordRPC = {

    async set() {
        if (CAFFEINATED.store.get("enable_discord_presence") && CAFFEINATED.streamdata.is_live) {
            const { streamer, start_time, title } = CAFFEINATED.streamdata;

            const image = `${streamer.platform.toLowerCase()}-logo`;
            const start = new Date(start_time);

            const link = streamer.link;

            const liveMessage = `Live on ${prettifyString(streamer.platform)}`;

            discordRPCClient.request("SET_ACTIVITY", {
                pid: process.pid,
                activity: {
                    state: title,
                    timestamps: {
                        // Funky normalization below...
                        start: start.getTime() + 2
                        // Told ya.
                    },
                    assets: {
                        large_image: image,
                        large_text: liveMessage
                    },
                    buttons: [
                        { label: "Watch Now", url: link }
                    ]
                }
            });
        } else {
            this.clear();
        }
    },

    async clear() {
        discordRPCClient.clearActivity();
    }

}

const FileStore = {
    store: new Store({
        name: "files"
    }),

    getFile(module, name, defaultValue) {
        const path = `modules.${module.namespace}.${module.id}.${name}`;

        return this.store.get(path) ?? defaultValue;
    },

    setFile(module, name, data = null) {
        const path = `modules.${module.namespace}.${module.id}.${name}`;

        this.store.set(path, data);

        console.debug(`Saved file ${path}`);
    }
};

const CAFFEINATED = new Caffeinated();
const MODULES = new Modules();

const koi = new Koi(`wss://${CAFFEINATED.store.get("server_domain")}${CAFFEINATED.store.get("experimental.use_beta_koi_path") ? "/beta/v2/koi" : "/v2/koi"}?client_id=${CLIENT_ID}`);

const UI = {
    slapCounter: 0,
    dootCounter: 0,
    doots: [],
    dootSize: 35,
    dootCanvas: document.querySelector("#doot-rain"),
    dootImg: new Image(),
    metaTaskDisplay: 0,
    animatingMeta: false,
    authCallback: (token) => CAFFEINATED.setToken(token),
    backCallback: () => this.loginScreen("NONE"),

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
        const element = document.querySelector(".user-username-text");
        let newHtml = "";

        if (username) {
            newHtml += escapeHtml(username);

            badges.forEach((badge) => {
                newHtml += `<img style="height: 1.1em; transform: translateY(.2em); padding-left: 3px;" src=${badge} />`;
            })
        }

        element.innerHTML = newHtml;
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

    reset() {
        this.setUserImage(null, "");
        this.setUserName("");
        this.setUserPlatform(null, "");
    },

    loginPuppet() {
        this.authCallback = (puppetToken) => CAFFEINATED.setPuppetToken(puppetToken);

        this.loginScreen("SUCCESS", true);

        setTimeout(() => {
            document.querySelector("#login").classList.remove("hide");
            anime({
                targets: "#login",
                easing: "linear",
                opacity: 1,
                duration: 175
            });
        }, 250);
    },

    loginScreen(screen, force) {
        if (!document.querySelector("#login").classList.contains("hide") || force) {
            const buttons = document.querySelector("#login-buttons");
            const waiting = document.querySelector("#login-waiting");
            const success = document.querySelector("#login-success");

            const loginCaffeine = document.querySelector("#login-caffeine");
            const loginBrime = document.querySelector("#login-brime");
            const mfaCaffeine = document.querySelector("#mfa-caffeine");

            anime({
                targets: [buttons, waiting, success, loginCaffeine, mfaCaffeine, loginBrime],
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
                } else if (screen === "BRIME") {
                    // Why hello mr snoopy :^)
                    // Don't do what we're doing unless Geeken tells you to.
                    // You might not like his firey wrath or the swift ban that follows.
                    // You have been warned.
                    loginBrime.classList.remove("hide");

                    anime({
                        targets: loginBrime,
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

    doot(worth = 1) {
        if (this.dootCounter >= 0) {
            this.dootCounter += worth;

            const dootening = this.dootCounter >= 20;

            const audio = new Audio(
                dootening ?
                    "https://assets.casterlabs.co/doot/2.mp3" :
                    "https://assets.casterlabs.co/doot/1.mp3");

            if (dootening) {
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
                    this.dootCounter -= worth;
                }, 10000);
            }

            audio.volume = 0.1;
            audio.play();
        }
    },

    async regenerateWidgetManager() {
        // Create the select box.
        {
            const createTypes = document.querySelector("#manage-widgets #create-type");

            const types = [];

            MODULES.getAllModuleNamespaces().forEach((namespace) => {
                const name = prettifyString(namespace);

                types.push(`
                    <option value=${namespace}>
                        ${name}
                    </option>
                `);
            });

            createTypes.innerHTML = types.join();
        }

        // Create the delete buttons
        {
            const moduleDeletionElement = document.querySelector("#manage-widgets #module-deletion");

            moduleDeletionElement.innerHTML = "";

            MODULES.getAllModules(true).forEach((holder) => {
                const module = holder.getInstance();

                const container = document.createElement("span");
                const deleteButton = document.createElement("a");

                deleteButton.innerHTML = `<ion-icon name="trash"></ion-icon>`;

                deleteButton.addEventListener("click", () => {
                    MODULES.deleteModuleInstance(module);
                    UI.regenerateWidgetManager();
                });

                const name = module.displayname ?
                    LANG.getTranslation(module.displayname) :
                    prettifyString(module.id);

                container.innerHTML = `
                    <span>${name}</span>
                `;

                container.appendChild(deleteButton);

                moduleDeletionElement.appendChild(container);
                moduleDeletionElement.appendChild(document.createElement("br"));
            });
        }
    },

    setBackCallback(callback) {
        if (callback) {
            this.backCallback = callback;
        } else {
            this.backCallback = () => this.loginScreen("NONE");
        }
    },

    login(platform, link) {
        this.loginScreen("LOGIN_AWAIT");

        const auth = new AuthCallback(platform);

        // 15min timeout
        auth.awaitAuthMessage((15 * 1000) * 60).then((token) => {
            ANALYTICS.logSignin();
            this.authCallback(token);
        }).catch((reason) => {
            console.error("Could not await for token: " + reason);
            this.backCallback();
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

                fetch(`https://${CAFFEINATED.store.get("server_domain")}/v2/natsukashii/create?platform=CAFFEINE&token=${refreshToken}`).then((nResult) => nResult.json()).then((nResponse) => {
                    if (nResponse.data) {
                        ANALYTICS.logSignin();
                        this.authCallback(nResponse.data.token);
                    } else {
                        this.loginScreen("CAFFEINE");
                    }
                });
            }
        }).catch(() => {
            this.loginScreen("CAFFEINE");
        });
    },

    loginBrime() {
        const email = document.querySelector("#login-brime-email");
        const password = document.querySelector("#login-brime-password");

        const loginPayload = {
            email: email.value,
            password: password.value
        }

        this.loginScreen("WAITING");

        fetch("https://api-staging.brimelive.com/internal/auth/login?client_id=605fadfe563212359ce4eb8b", {
            method: "POST",
            body: JSON.stringify(loginPayload),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        }).then((result) => result.json()).then((response) => {
            if (response.data) {
                const token = response.data.refreshToken;

                email.value = "";
                password.value = "";

                fetch(`https://${CAFFEINATED.store.get("server_domain")}/v2/natsukashii/create?platform=BRIME&token=${token}`).then((nResult) => nResult.json()).then((nResponse) => {
                    if (nResponse.data) {
                        ANALYTICS.logSignin();
                        this.authCallback(nResponse.data.token);
                    } else {
                        this.loginScreen("BRIME");
                    }
                });
            } else {
                this.loginScreen("BRIME");
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
    },

    toggleMetaDisplay() {
        if (!CAFFEINATED.userdata) {
            anime({
                targets: "#user-meta-text",
                easing: "linear",
                opacity: 0,
                duration: 100,
            });
            this.animatingMeta = false;
        } else if (!this.animatingMeta) {
            const element = document.querySelector("#user-meta-text");
            this.animatingMeta = true;

            if (CAFFEINATED.userdata.streamer.subscriber_count > -1) {
                anime({
                    targets: element,
                    easing: "linear",
                    opacity: 0,
                    duration: 100,
                }).finished.then(() => {
                    let text;

                    if (UI.metaTaskDisplay == 1) {
                        UI.metaTaskDisplay = 0;
                        text = LANG.getTranslation("caffeinated.internal.subscribers_count_text", kFormatter(CAFFEINATED.userdata.streamer.subscriber_count, 2));
                    } else {
                        UI.metaTaskDisplay = 1;
                        text = LANG.getTranslation("caffeinated.internal.followers_count_text", kFormatter(CAFFEINATED.userdata.streamer.followers_count, 2));
                    }

                    element.innerText = text;

                    anime({
                        targets: element,
                        easing: "linear",
                        opacity: 1,
                        duration: 100,
                    }).finished.then(() => {
                        this.animatingMeta = false;
                    });
                });
            } else {
                element.innerText = LANG.getTranslation("caffeinated.internal.followers_count_text", kFormatter(CAFFEINATED.userdata.streamer.followers_count, 2));

                if (element.style.opacity == 0) {
                    anime({
                        targets: element,
                        easing: "linear",
                        opacity: 1,
                        duration: 100,
                    }).finished.then(() => {
                        this.animatingMeta = false;
                    });
                } else {
                    this.animatingMeta = false;
                }
            }
        }
    }

};

UI.init();
UI.reset();

setInterval(() => {
    UI.toggleMetaDisplay();
}, 20 * 1000); // 20s

LANG.translate(document.querySelector(".menu-button-title"));

if (CAFFEINATED.store.get("experimental.manage_widgets")) {
    document.querySelector(".manage-widgets-container").classList.remove("hide");
} else {
    document.querySelector(".manage-widgets-container").classList.add("hide");
}

/* Manage Widgets Page */

document.querySelector("#submit-create").addEventListener("click", async () => {
    const createTypeElement = document.querySelector("#manage-widgets #create-type");
    const nameElement = document.querySelector("#manage-widgets #create-name");

    const namespace = createTypeElement.options[createTypeElement.selectedIndex].value;
    const name = nameElement.value.trim();

    nameElement.value = "";

    if (name.length == 0) {
        alert("Widget must have a name.");
    } else {
        await MODULES.createNewModuleInstance(namespace, name);

        UI.regenerateWidgetManager();
    }
});

/* Koi */
koi.addEventListener("close", () => {
    CONNECTED = false;
    koi.reconnect();

    DiscordRPC.clear();

    setTimeout(() => {
        if (!CONNECTED) {
            UI.splashText("Reconnecting to Casterlabs.");
            UI.splashScreen(true);
        }
    }, 2000);
});

koi.addEventListener("user_update", (event) => {
    ANALYTICS.logUserUpdate(event);

    UI.splashScreen(false);
    UI.loginScreen("HIDE");
    UI.setUserImage(event.streamer.image_link, event.streamer.displayname);
    UI.setUserName(event.streamer.displayname, event.streamer.badges);
    UI.setUserPlatform(event.streamer.platform, event.streamer.link);

    CAFFEINATED.userdata = event;
    UI.toggleMetaDisplay();
});

koi.addEventListener("stream_status", (event) => {
    CAFFEINATED.streamdata = event;

    if (event.is_live) {
        DiscordRPC.set();
    } else {
        DiscordRPC.clear();
    }
});

koi.addEventListener("x_caffeinated_command", async (command) => {
    const text = command.text;
    const lowercase = text.toLowerCase();

    console.debug("Caffeinated Command: " + text);

    if (lowercase.startsWith("/caffeinated serverdomain ")) {
        const newDomain = lowercase.substring("/caffeinated serverdomain ".length);

        CAFFEINATED.store.set("server_domain", newDomain);
        location.reload();
    } else if (lowercase.startsWith("/caffeinated channel ")) {
        const channel = lowercase.substring("/caffeinated channel ".length).toUpperCase();

        CAFFEINATED.setChannel(channel);
    } else if (lowercase.startsWith("/caffeinated experimental ")) {
        const flag = "experimental." + lowercase.substring("/caffeinated experimental ".length);
        const newValue = !CAFFEINATED.store.get(flag);

        CAFFEINATED.store.set(flag, newValue);

        if (flag == "experimental.manage_widgets") {
            if (newValue) {
                document.querySelector(".manage-widgets-container").classList.remove("hide");
            } else {
                document.querySelector(".manage-widgets-container").classList.add("hide");
            }
        }

        alert(`Set ${flag} to ${newValue}`);

        // Reload after the alert is cleared.
        if (flag == "experimental.use_beta_koi_path") {
            location.reload();
        }
    } else {
        switch (lowercase) {
            case "/caffeinated devtools": {
                if (BROWSERWINDOW.isDevToolsOpened()) {
                    BROWSERWINDOW.closeDevTools();
                } else {
                    BROWSERWINDOW.openDevTools();
                }
                return;
            }

            case "/caffeinated forceupdate": {
                CAFFEINATED.store.set("protocol_version", -1);
                app.relaunch();
                app.exit();
                return;
            }

            default: {
                alert(`Unrecognized command: "${text}"`);
                return;
            }
        }
    }
});

koi.addEventListener("error", (event) => {
    let error = event.error;

    switch (error) {
        case "PUPPET_AUTH_INVALID": {
            ANALYTICS.logPuppetSignout();

            CAFFEINATED.store.delete("puppet_token");
            CAFFEINATED.puppetToken = null;

            // TODO make this alert better
            alert("Chat bot user auth invalid, please log back in.");
            break;
        }

        case "USER_AUTH_INVALID": {
            ANALYTICS.logSignout();

            CAFFEINATED.userdata = null;

            DiscordRPC.clear();

            UI.toggleMetaDisplay();
            UI.splashScreen(false);
            UI.triggerLogin();

            CAFFEINATED.store.delete("token");
            CAFFEINATED.token = null;
            break;
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

document.querySelector("#changelog-close").addEventListener("click", () => {
    document.querySelector("#changelog").classList = "hide";
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
                We have a Discord!
            </a>
        `;
    }, "#7289da");
}, (5 * 60) * 1000);

setTimeout(() => {
    CAFFEINATED.triggerBanner("twitter-banner", (element) => {
        element.innerHTML = `
            <a style="margin-left: 5px; color: white; text-decoration: underline;" onclick="openLink('https:\/\/casterlabs.co/twitter');">
                We have a Twitter!
            </a>
        `;
    }, "#00acee");
}, (25 * 60) * 1000);
