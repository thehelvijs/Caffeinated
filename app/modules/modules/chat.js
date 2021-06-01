
MODULES.moduleClasses["casterlabs_chat"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat";
        this.displayname = "caffeinated.chat.title";
        this.type = "overlay settings";
        this.id = id;

        this.catchups = [];
    }

    widgetDisplay = [
        {
            name: "Test",
            icon: "dice",
            onclick(instance) {
                koi.test("chat");
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://widgets.casterlabs.co/chat.html?id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        return this.settings;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        this.sendCatchups(socket);
    }

    init() {
        koi.addEventListener("meta", (event) => {
            this.sendMessage(event);
        });

        koi.addEventListener("chat", (event) => {
            this.sendMessage(event);
        });

        koi.addEventListener("donation", (event) => {
            if (this.settings.show_donations) {
                this.sendMessage(event);
            }
        });

        koi.addEventListener("channel_points", (event) => {
            // this.addPointStatus(event.sender, event.reward);
        });

        koi.addEventListener("follow", (event) => {
            // this.addStatus(event.follower, "caffeinated.chatdisplay.follow_text");
        });

        koi.addEventListener("CATCHUP", (event) => {
            this.catchups = event.events;
            this.sendCatchups();
        });

    }

    sendCatchups(socket) {
        for (const catchup of this.catchups) {
            MODULES.emitIO(this, "event", catchup, socket);
        }
    }

    sendMessage(event) {
        this.catchups.push(event);

        MODULES.emitIO(this, "event", event);

        if (this.catchups.length > 100) {
            this.catchups.shift();
        }
    }

    // TODO status messages.
    /*
        addStatus(profile, langKey) {
            const usernameHtml = `<span style="color: ${profile.color};">${escapeHtml(profile.displayname)}</span>`;
            const lang = LANG.getTranslation(langKey, usernameHtml);
    
            this.addManualStatus(lang);
        }
    
        addPointStatus(profile, reward) {
            const usernameHtml = `<span style = "color: ${profile.color};" > ${escapeHtml(profile.displayname)}</span> `;
            const imageHtml = `<img class="vcimage" src = "${reward.reward_image ?? reward.default_reward_image}" /> `;
    
            const lang = LANG.getTranslation("caffeinated.chatdisplay.reward_text", usernameHtml, reward.title, imageHtml);
    
            this.addManualStatus(lang);
        }
    
        addManualStatus(lang) {
            this.sendMessage({
                type: "STATUS",
                lang: lang
            });
        }
    */

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        font: {
            display: "generic.font",
            type: "font",
            isLang: true
        },
        font_size: {
            display: "generic.font.size",
            type: "number",
            isLang: true
        },
        text_color: {
            display: "generic.text.color",
            type: "color",
            isLang: true
        },
        show_donations: {
            display: "caffeinated.chat.show_donations",
            type: "checkbox",
            isLang: true
        },
        chat_direction: {
            display: "caffeinated.chat.chat_direction",
            type: "select",
            isLang: true
        },
        chat_animation: {
            display: "caffeinated.chat.chat_animation",
            type: "select",
            isLang: true
        },
        text_align: {
            display: "caffeinated.chat.text_align",
            type: "select",
            isLang: true
        }
    };

    defaultSettings = {
        font: "Poppins",
        font_size: "16",
        show_donations: true,
        text_color: "#FFFFFF",
        chat_direction: [
            "Down",
            "Up"
        ],
        chat_animation: [
            "Default",
            "Slide",
            "Slide (Disappearing)",
            "Disappearing"
        ],
        text_align: [
            "Left",
            "Right"
        ]
    };

};
