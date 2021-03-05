
MODULES.moduleClasses["casterlabs_companion"] = class {

    constructor(id) {
        this.namespace = "casterlabs_companion";
        this.displayname = "caffeinated.companion.title";
        this.type = "settings";
        this.id = id;

        this.messageHistory = [];
        this.viewersList = [];

        this.kinoko = new Kinoko();

        this.defaultSettings.reset_link = () => {
            this.uuid = generateUnsafeUniquePassword(16);
            this.setLinkText();
            this.connect();
            MODULES.saveToStore(this);
        };

        this.defaultSettings.copy_link = () => {
            putInClipboard(`https://casterlabs.co/companion?key=${this.uuid}`);
        };

        this.kinoko.on("message", (data) => {
            switch (data.type.toLowerCase()) {
                case "connected": {
                    this.sendAll();
                    return;
                }

            }
        });

    }

    sendAll() {
        if (CAFFEINATED.userdata) {
            this.sendEvent("message_history", this.messageHistory, true);
            this.sendEvent("viewers_list", this.viewersList, true);
        }
    }

    sendEvent(type, event, isCatchup = false) {
        this.send("event", {
            type: type,
            event: event,
            is_catchup: isCatchup
        });
    }

    send(type, data) {
        this.kinoko.send({
            type: type,
            data: data
        });
    }

    getDataToStore() {
        return {
            uuid: this.uuid,
            enabled: this.settings.enabled
        };
    }

    connect() {
        this.kinoko.disconnect();

        if (this.settings.enabled) {
            this.kinoko.connect("companion:" + this.uuid, "parent");
        }
    }

    setLinkText() {
        this.qrWindow.setCode(`https://casterlabs.co/companion?key=${this.uuid}`);
    }

    init() {
        this.qrWindow = this.page.querySelector("iframe").contentWindow;
        this.uuid = this.settings.uuid;

        if (!this.uuid || this.uuid.includes("-")) {
            this.uuid = generateUnsafeUniquePassword(16);

            MODULES.saveToStore(this);
        }

        this.page.querySelector("iframe").style.marginBottom = "35px";

        // Give the frame time to render.
        setTimeout(() => {
            this.setLinkText();
            this.connect();
        }, 5000);

        koi.addEventListener("chat", (event) => {
            this.addMessage(event);
        });

        koi.addEventListener("donation", (event) => {
            this.addMessage(event);
        });

        koi.addEventListener("meta", (event) => {
            this.messageMeta(event);
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
            this.addStatus(event.viewer, "caffeinated.chatdisplay.join_text");
        });

        koi.addEventListener("viewer_leave", (event) => {
            this.addStatus(event.viewer, "caffeinated.chatdisplay.leave_text");
        });

        koi.addEventListener("viewer_list", (event) => {
            this.viewersList = event.viewers;

            this.sendEvent("viewers_list", this.viewersList);
        });

    }

    /* Handler Code */
    messageMeta(event) {
        this.messageHistory.push({
            type: "META",
            event: Object.assign({}, event)
        });

        this.sendEvent("meta", event);
    }

    addMessage(event) {
        this.messageHistory.push({
            type: "MESSAGE",
            event: Object.assign({}, event)
        });

        this.sendEvent("message", event);
    }

    addStatus(profile, langKey, id) {
        const usernameHtml = `<span style="color: ${profile.color};">${escapeHtml(profile.displayname)}</span>`;
        const lang = LANG.getTranslation(langKey, usernameHtml);

        const event = {
            profile: profile,
            lang: lang,
            id: id
        };

        this.messageHistory.push({
            type: "STATUS",
            event: event
        });

        this.sendEvent("status", event);
    }

    addPointStatus(profile, reward, langKey) {
        const usernameHtml = `<span style = "color: ${profile.color};" > ${escapeHtml(profile.displayname)}</span> `;
        const imageHtml = `<img class="vcimage" src = "${reward.reward_image ?? reward.default_reward_image}" /> `;

        const lang = LANG.getTranslation(langKey, usernameHtml, reward.title, imageHtml);

        const event = {
            profile: profile,
            lang: lang, id: id
        };

        this.messageHistory.push({
            type: "STATUS",
            event: event
        });

        this.sendEvent("status", event);
    }

    addManualStatus(profile, status) {
        const event = {
            profile: profile,
            lang: status
        };

        this.messageHistory.push({
            type: "STATUS",
            event: event
        });

        this.sendEvent("status", event);
    }

    onSettingsUpdate() {
        this.setLinkText();
        this.connect();
    }

    settingsDisplay = {
        enabled: {
            display: "generic.enabled",
            type: "checkbox",
            isLang: true
        },
        qr_frame: {
            type: "iframe-src",
            height: "175px",
            width: "175px"
        },
        copy_link: {
            display: "caffeinated.companion.copy",
            type: "button",
            isLang: true
        },
        reset_link: {
            display: "caffeinated.companion.reset",
            type: "button",
            isLang: true
        }
    };

    defaultSettings = {
        enabled: false,
        qr_frame: __dirname + "/modules/modules/qr.html",
        // copy_link: () => {},
        // reset_link: () => {}
    };

};
