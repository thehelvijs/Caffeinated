
MODULES.uniqueModuleClasses["casterlabs_chat_display"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat_display";
        this.displayname = "caffeinated.chatdisplay.title";
        this.type = "application settings";
        this.id = id;
        this.icon = "chatbox";
        this.persist = true;

        this.messageHistory = [];
        this.viewersList = [];

        this.chatSrc = `${__dirname}/modules/modules/chatdisplay.html`;
        this.viewerSrc = `${__dirname}/modules/modules/chatviewers.html`;

        // Where the magic happens
        this.pageSrc = this.chatSrc;
    }

    onDockConnection(socket, type) {
        MODULES.addIOHandler(this, "open_link", openLink, socket);

        switch (type) {
            case "viewer": {
                MODULES.emitDockIO(this, "html", this.viewerContents, socket);

                MODULES.addIOHandler(this, "ready_init", () => {
                    MODULES.emitDockIO(this, "config", this.settings, socket);
                    MODULES.emitDockIO(this, "viewers", this.viewersList, socket);
                }, socket);
                break;
            }

            case "chat": {
                MODULES.addIOHandler(this, "upvote", (id) => {
                    koi.upvote(id);
                }, socket);


                MODULES.addIOHandler(this, "delete", (id) => {
                    koi.deleteMessage(id);
                }, socket);

                MODULES.addIOHandler(this, "chat", (message) => {
                    koi.sendMessage(message);
                }, socket);

                MODULES.emitDockIO(this, "html", this.chatContents, socket);

                MODULES.addIOHandler(this, "ready_init", () => {
                    MODULES.emitDockIO(this, "config", this.settings, socket);
                    MODULES.emitDockIO(this, "eval", `catchUp(${JSON.stringify(this.messageHistory)})`, socket);
                }, socket);
                break;
            }
        }
    }

    getDataToStore() {
        return this.settings;
    }

    async init() {
        this.chatContents = await (
            await fetch(this.chatSrc)
        ).text();

        this.viewerContents = await (
            await fetch(this.viewerSrc)
        ).text();

        this.contentWindow = this.page.querySelector("iframe").contentWindow;
        this.contentDocument = this.contentWindow.document;

        koi.addEventListener("chat", (event) => {
            this.addMessage(event);
        });

        koi.addEventListener("donation", (event) => {
            this.addMessage(event);
        });

        koi.addEventListener("meta", (event) => {
            this.messageMeta(event);
        });

        koi.addEventListener("clearchat", (event) => {
            this.clearChat(event);
        });

        koi.addEventListener("channel_points", (event) => {
            this.addPointStatus(event.sender, event.reward, "caffeinated.chatdisplay.reward_text", event.id);
        });

        koi.addEventListener("follow", (event) => {
            this.addStatus(event.follower, "caffeinated.chatdisplay.follow_text");
        });

        koi.addEventListener("subscription", (event) => {
            const profile = event.gift_recipient ?? event.subscriber;

            this.addManualStatus(profile, LANG.formatSubscription(event));
        });

        koi.addEventListener("viewer_join", (event) => {
            if (event.viewer.platform !== "BRIME") {
                this.addStatus(event.viewer, "caffeinated.chatdisplay.join_text", event.id, "viewer");
            }
        });

        koi.addEventListener("viewer_leave", (event) => {
            if (event.viewer.platform !== "BRIME") {
                this.addStatus(event.viewer, "caffeinated.chatdisplay.leave_text", event.id, "viewer");
            }
        });

        koi.addEventListener("viewer_list", (event) => {
            this.viewersList = event.viewers;

            this.updateViewers();
        });

        /* Listeners */
        const viewersPopout = this.contentDocument.querySelector("#vcpopoutviewers");

        this.contentDocument.addEventListener("upvote_request", (e) => {
            koi.upvote(e.detail.id);
        });

        this.contentDocument.addEventListener("delete_request", (e) => {
            koi.deleteMessage(e.detail.id);
        });

        this.contentDocument.addEventListener("send_message", (e) => {
            koi.sendMessage(e.detail.message);
        });

        this.contentDocument.addEventListener("open_link", (e) => {
            openLink(e.detail.link);
        });

        viewersPopout.addEventListener("click", () => {
            this.createViewersWindow();
        });

        this.contentDocument.querySelector("#vcpopout").addEventListener("click", () => {
            this.createPopoutWindow();
        });

        koi.addEventListener("user_update", (event) => {
            // They don't have that sort of viewer data available.
            if ([
                "TROVO",
                "GLIMESH"
            ].includes(event.streamer.platform)) {
                viewersPopout.classList.add("hide");
            } else {
                viewersPopout.classList.remove("hide");
            }
        });

    }

    onSettingsUpdate() {
        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(`updateConfig(${JSON.stringify(this.settings)});`);
        }

        MODULES.emitDockIO(this, "config", this.settings);
    }

    settingsDisplay = {
        font_size: {
            display: "generic.font.size",
            type: "number",
            isLang: true
        },
        // show_donations: {
        //     display: "caffeinated.chat.show_donations",
        //     type: "checkbox",
        //     isLang: true
        // },
        // show_follows: {
        //     display: "caffeinated.chat.show_follows",
        //     type: "checkbox",
        //     isLang: true
        // },
        show_viewers: {
            display: "caffeinated.chatdisplay.show_viewers",
            type: "checkbox",
            isLang: true
        },
        copy_chat_dock_link: {
            display: "caffeinated.chatdisplay.copy_chat_dock_link",
            type: "button",
            isLang: true
        },
        copy_viewers_dock_link: {
            display: "caffeinated.chatdisplay.copy_viewers_dock_link",
            type: "button",
            isLang: true
        }
    };

    defaultSettings = {
        font_size: 16,
        show_viewers: true,
        copy_chat_dock_link(instance) {
            putInClipboard(`https://widgets.casterlabs.co/dock/?namespace=${instance.namespace}&id=${instance.id}&type=chat`);
        },
        copy_viewers_dock_link(instance) {
            putInClipboard(`https://widgets.casterlabs.co/dock/?namespace=${instance.namespace}&id=${instance.id}&type=viewer`);
        }
    };

    createViewersWindow() {
        if (!this.viewersWindow) {
            const mainWindowState = windowStateKeeper({
                defaultWidth: 200,
                defaultHeight: 500,
                file: "caffeinated-viewers-popout-window.json"
            });

            this.viewersWindow = new BrowserWindow({
                minWidth: 200,
                minHeight: 500,
                width: mainWindowState.width,
                height: mainWindowState.height,
                x: mainWindowState.x,
                y: mainWindowState.y,
                resizable: true,
                transparent: false,
                alwaysOnTop: true,
                show: false,
                titleBarStyle: "shown",
                icon: __dirname + "/media/app_icon.png",
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true
                }
            });

            this.contentDocument.querySelector("#vcpopoutviewers").classList.add("hide");

            this.viewersWindow.once("close", () => {
                this.contentDocument.querySelector("#vcpopoutviewers").classList.remove("hide");
                this.viewersWindow = null;
            });

            this.viewersWindow.once("ready-to-show", () => {
                this.updateViewers();

                this.viewersWindow.show();
            });

            this.viewersWindow.loadFile(__dirname + "/modules/modules/chatviewers.html");

            mainWindowState.manage(this.viewersWindow);
        }
    }

    createPopoutWindow() {
        if (!this.popoutWindow) {
            const mainWindowState = windowStateKeeper({
                defaultWidth: 300,
                defaultHeight: 500,
                file: "caffeinated-chat-popout-window.json"
            });

            this.popoutWindow = new BrowserWindow({
                minWidth: 300,
                minHeight: 500,
                width: mainWindowState.width,
                height: mainWindowState.height,
                x: mainWindowState.x,
                y: mainWindowState.y,
                resizable: true,
                transparent: false,
                alwaysOnTop: true,
                show: false,
                titleBarStyle: "shown",
                icon: __dirname + "/media/app_icon.png",
                frame: false,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true
                }
            });

            this.contentDocument.querySelector("#vcpopout").classList.add("hide");

            this.popoutWindow.once("close", () => {
                this.contentDocument.querySelector("#vcpopout").classList.remove("hide");
                this.popoutWindow = null;
            });

            this.popoutWindow.once("ready-to-show", () => {
                this.popoutWindow.show();

                this.popoutWindow.webContents.executeJavaScript(`catchUp(${JSON.stringify(this.messageHistory)})`);
            });

            this.popoutWindow.addListener("upvote_request", (id) => {
                koi.upvote(id);
            });

            this.popoutWindow.addEventListener("delete_request", (id) => {
                koi.deleteMessage(id);
            });

            this.popoutWindow.addListener("send_message", (message) => {
                koi.sendMessage(message);
            });

            this.popoutWindow.loadFile(__dirname + "/modules/modules/chatdisplay.html");

            mainWindowState.manage(this.popoutWindow);
        }
    }

    updateViewers() {
        MODULES.emitDockIO(this, "viewers", this.viewersList);

        if (this.viewersWindow) {
            this.viewersWindow.webContents.executeJavaScript(`setViewers(${JSON.stringify(this.viewersList)})`);
        }
    }

    messageMeta(event) {
        const script = `messageMeta(${JSON.stringify(event)})`;

        MODULES.emitDockIO(this, "eval", script);

        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(script);
        }

        this.messageHistory.push({
            type: "META",
            event: Object.assign({}, event)
        });

        this.contentWindow.messageMeta(event);
    }

    clearChat(event) {
        const script = `clearChat(${JSON.stringify(event)})`;

        MODULES.emitDockIO(this, "eval", script);

        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(script);
        }

        this.messageHistory.push({
            type: "CLEARCHAT",
            event: Object.assign({}, event)
        });

        this.contentWindow.clearChat(event);
    }

    addMessage(event) {
        const script = `addMessage(${JSON.stringify(event)})`;

        MODULES.emitDockIO(this, "eval", script);

        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(script);
        }

        this.messageHistory.push({
            type: "MESSAGE",
            event: Object.assign({}, event)
        });

        this.contentWindow.addMessage(event);
    }

    addStatus(profile, langKey, id, type) {
        const usernameHtml = `<span style="color: ${profile.color};">${escapeHtml(profile.displayname)}</span>`;
        const lang = LANG.getTranslation(langKey, usernameHtml);

        const script = `addStatus(${JSON.stringify(profile)}, ${JSON.stringify(lang)}, ${JSON.stringify(id)}, ${JSON.stringify(type)})`;

        MODULES.emitDockIO(this, "eval", script);

        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(script);
        }

        this.messageHistory.push({
            type: "STATUS",
            profile: profile,
            lang: lang,
            id: id
        });

        this.contentWindow.addStatus(profile, lang);
    }

    addPointStatus(profile, reward, langKey) {
        const usernameHtml = `<span style = "color: ${profile.color};" > ${escapeHtml(profile.displayname)}</span> `;
        const imageHtml = `<img class="vcimage" src = "${reward.reward_image ?? reward.default_reward_image}" /> `;

        const lang = LANG.getTranslation(langKey, usernameHtml, reward.title, imageHtml);

        const script = `addStatus(${JSON.stringify(profile)}, ${JSON.stringify(lang)})`;

        MODULES.emitDockIO(this, "eval", script);

        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(script);
        }

        this.messageHistory.push({
            type: "STATUS",
            profile: profile,
            lang: lang
        });

        this.contentWindow.addStatus(profile, lang);
    }

    addManualStatus(profile, status) {
        const script = `addStatus(${JSON.stringify(profile)}, ${JSON.stringify(status)})`;

        MODULES.emitDockIO(this, "eval", script);

        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(script);
        }

        this.messageHistory.push({
            type: "STATUS",
            profile: profile,
            lang: status
        });

        this.contentWindow.addStatus(profile, status);
    }

};
