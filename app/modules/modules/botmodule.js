
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
                    this.sendMessage(`@${event.sender.username} ${this.settings.donation_callout}`);
                }

                this.processCommand(event);
            }
        });

        koi.addEventListener("follow", (event) => {
            if (this.settings.enabled) {
                if (this.settings.follow_callout) {
                    this.sendMessage(`@${event.follower.username} ${this.settings.follow_callout}`);
                }
            }
        });
    }

    processCommand(event) {
        const message = event.message.toLowerCase();

        for (const command of this.settings.commands) {
            const trigger = command.trigger.toLowerCase();

            if (
                ((command.type == "Command") && message.startsWith(trigger)) ||
                // So we do normal detection, then check to see if the sender is the streamer.
                ((command.type == "Keyword") && message.includes(trigger) &&
                    (
                        // Then, we check the contents of the message against it to ensure we're not 
                        // spamming the streamer's own account with replys
                        (event.sender.UUID != event.streamer.UUID) || !message.endsWith(command.reply.toLowerCase())
                    )
                )
            ) {
                this.sendMessage(`@${event.sender.username} ${command.reply}`);
                return;
            }
        }
    }

    sendMessage(message) {
        koi.sendMessage(message.substring(0, this.getMaxLength()));
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

    getMaxLength() {
        if (isPlatform("CAFFEINE")) {
            return 80;
        } else if (isPlatform("TWITCH")) {
            return 500;
        }
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
                reply: getTranslation("caffeinated.chatbot.default_reply")
            }
        },
        follow_callout: getTranslation("caffeinated.chatbot.default_follow_callout"),
        donation_callout: getTranslation("caffeinated.chatbot.default_donation_callout")
    };

};
