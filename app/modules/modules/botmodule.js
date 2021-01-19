
MODULES.moduleClasses["casterlabs_bot"] = class {

    constructor(id) {
        this.namespace = "casterlabs_bot";
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
            display: "Enabled",
            type: "checkbox",
            isLang: false // TODO
        },
        commands: {
            display: "Commands",
            type: "dynamic",
            isLang: false // TODO
        },
        follow_callout: {
            display: "Follow Callout (Leave blank to disable)",
            type: "input",
            isLang: false // TODO
        },
        donation_callout: {
            display: "Donation Callout (Leave blank to disable)",
            type: "input",
            isLang: false // TODO
        }
    };

    defaultSettings = {
        enabled: false,
        commands: {
            display: {
                type: {
                    display: "Command Type",
                    type: "select",
                    isLang: false
                },
                trigger: {
                    display: "Trigger",
                    type: "input",
                    isLang: false
                },
                reply: {
                    display: "Reply",
                    type: "textarea",
                    isLang: false
                }
            },
            default: {
                type: ["Command", "Keyword"],
                trigger: "!casterlabs",
                mention: true,
                reply: "Casterlabs is a free stream widget service!"
            }
        },
        follow_callout: "Thanks for the follow!",
        donation_callout: "Thanks for the support!"
    };

};
