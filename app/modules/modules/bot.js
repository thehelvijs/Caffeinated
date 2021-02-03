
MODULES.moduleClasses["casterlabs_bot"] = class {

    constructor(id) {
        this.namespace = "casterlabs_bot";
        this.displayname = "caffeinated.chatbot.title";
        this.type = "settings";
        this.id = id;
    }

    getDataToStore() {
        return this.settings;
    }

    init() {
        this.limitFields();

        koi.addEventListener("user_update", () => {
            setTimeout(() => this.limitFields(), 100);
        });

        koi.addEventListener("chat", (event) => {
            if (this.settings.enabled) {
                this.processCommand(event);
            }
        });

        koi.addEventListener("donation", (event) => {
            if (this.settings.enabled) {
                if (this.settings.donation_callout) {
                    this.sendMessage(`@${event.sender.displayname} ${this.settings.donation_callout}`, event);
                }

                this.processCommand(event);
            }
        });

        koi.addEventListener("donation", (event) => {
            if (this.settings.enabled) {
                if (this.settings.welcome_callout) {
                    this.sendMessage(`@${event.sender.displayname} ${this.settings.welcome_callout}`, event);
                }

                this.processCommand(event);
            }
        });

        koi.addEventListener("follow", (event) => {
            if (this.settings.enabled) {
                if (this.settings.follow_callout) {
                    this.sendMessage(`@${event.follower.displayname} ${this.settings.follow_callout}`, event);
                }
            }
        });
    }

    processCommand(event) {
        const message = event.message.toLowerCase();

        for (const command of this.settings.commands) {
            if (message.endsWith(command.reply.toLowerCase())) {
                return; // Loop detected.
            }
        }

        // Second pass.
        for (const command of this.settings.commands) {
            const trigger = command.trigger.toLowerCase();

            if (
                ((command.type == "Command") && message.startsWith(trigger)) ||
                ((command.type == "Keyword") && message.includes(trigger))
            ) {
                this.sendMessage(`@${event.sender.displayname} ${command.reply}`, event);
                return;
            }
        }
    }

    sendMessage(message, event) {
        koi.sendMessage(message.substring(0, this.getMaxLength(event)), event);
    }

    limitFields() {
        // It's 10 less to help fit in the mention
        const max = this.getMaxLength() - 10;

        Array.from(this.page.querySelectorAll("[name=reply][owner=chat_bot]")).forEach((element) => {
            element.setAttribute("maxlength", max);
        });

        this.page.querySelector("[name=follow_callout][owner=chat_bot]").setAttribute("maxlength", max);
        this.page.querySelector("[name=donation_callout][owner=chat_bot]").setAttribute("maxlength", max);
    }

    getMaxLength(event = CAFFEINATED.userdata) {
        if (event) {
            const platform = event.streamer.platform;

            switch (platform) {
                case "CAFFEINE":
                    return 80;

                case "TWITCH":
                    return 500;

                case "TROVO":
                    return 300;

                default:
                    console.debug(platform);
            }
        }

        return 100; // ?
    }

    onSettingsUpdate() {
        this.limitFields();
    }

    settingsDisplay = {
        enabled: {
            display: "caffeinated.chatbot.enabled",
            type: "checkbox",
            isLang: true
        },
        commands: {
            display: "caffeinated.chatbot.commands",
            type: "dynamic",
            isLang: true
        },
        follow_callout: {
            display: "caffeinated.chatbot.follow_callout",
            type: "input",
            isLang: true
        },
        donation_callout: {
            display: "caffeinated.chatbot.donation_callout",
            type: "input",
            isLang: true
        },
        welcome_callout: {
            display: "caffeinated.chatbot.welcome_callout",
            type: "input",
            isLang: true
        }
    };

    defaultSettings = {
        enabled: false,
        commands: {
            display: {
                type: {
                    display: "caffeinated.chatbot.command_type",
                    type: "select",
                    isLang: true
                },
                trigger: {
                    display: "caffeinated.chatbot.trigger",
                    type: "input",
                    isLang: true
                },
                reply: {
                    display: "caffeinated.chatbot.reply",
                    type: "textarea",
                    isLang: true
                }
            },
            default: {
                type: ["Command", "Keyword"],
                trigger: "!casterlabs",
                mention: true,
                reply: LANG.getTranslation("caffeinated.chatbot.default_reply")
            }
        },
        follow_callout: "",
        donation_callout: "",
        welcome_callout: ""
    };

};
