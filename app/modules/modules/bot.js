
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
                    koi.sendMessage(`@${event.sender.displayname} ${this.settings.donation_callout}`, event);
                }

                this.processCommand(event);
            }
        });

        koi.addEventListener("viewer_join", (event) => {
            if (this.settings.enabled) {
                if (this.settings.welcome_callout && (event.streamer.platform === "TROVO")) {
                    koi.sendMessage(`@${event.sender.displayname} ${this.settings.welcome_callout}`, event);
                }
            }
        });

        koi.addEventListener("follow", (event) => {
            if (this.settings.enabled) {
                if (this.settings.follow_callout) {
                    koi.sendMessage(`@${event.follower.displayname} ${this.settings.follow_callout}`, event);
                }
            }
        });
    }

    processCommand(event) {
        const message = event.message.toLowerCase();

        if (this.settings.enable_uptime_command && message.startsWith("!uptime")) {
            if (CAFFEINATED.streamdata && CAFFEINATED.streamdata.is_live) {
                const millis = CAFFEINATED.getTimeLiveInMilliseconds();
                const formatted = getFriendlyTime(millis);

                koi.sendMessage(`@${event.sender.displayname} ${LANG.getTranslation("caffeinated.chatbot.uptime_command.format", formatted)} `, event);
            } else {
                koi.sendMessage(`@${event.sender.displayname} ${LANG.getTranslation("caffeinated.chatbot.uptime_command.not_live")} `, event);
            }
            return;
        }

        for (const command of this.settings.commands) {
            if (message.endsWith(command.reply.toLowerCase())) {
                return; // Loop detected.
            }
        }

        // Second pass.
        for (const command of this.settings.commands) {
            const trigger = command.trigger.toLowerCase();

            if ((command.type == "Script") && message.startsWith(trigger)) {
                const eventVar = "const event = arguments[0];\n";
                const result = looseInterpret(eventVar + command.reply, event);

                if (result) {
                    if (result instanceof Promise) {
                        result.then((message) => {
                            if (message) {
                                koi.sendMessage(message.toString(), event);
                            }
                        })
                    } else {
                        koi.sendMessage(result.toString(), event);
                    }
                }

                return;
            } else if (
                ((command.type == "Command") && message.startsWith(trigger)) ||
                ((command.type == "Keyword") && message.includes(trigger))
            ) {
                koi.sendMessage(`@${event.sender.displayname} ${command.reply} `, event);
                return;
            }
        }
    }

    limitFields() {
        // It's 10 less to help fit in the mention
        const max = koi.getMaxLength() - 10;

        /*
        Array.from(this.page.querySelectorAll("[name=reply][owner=chat_bot]")).forEach((element) => {
            element.setAttribute("maxlength", max);
        });
        */

        this.page.querySelector("[name=follow_callout][owner=chat_bot]").setAttribute("maxlength", max);
        this.page.querySelector("[name=donation_callout][owner=chat_bot]").setAttribute("maxlength", max);
        this.page.querySelector("[name=welcome_callout][owner=chat_bot]").setAttribute("maxlength", max);

        if (CAFFEINATED.userdata && (CAFFEINATED.userdata.streamer.platform === "TROVO")) {
            this.page.querySelector("[name=welcome_callout][owner=chat_bot]").parentElement.classList.remove("hide");
        } else {
            this.page.querySelector("[name=welcome_callout][owner=chat_bot]").parentElement.classList.add("hide");
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
        enable_uptime_command: {
            display: "caffeinated.chatbot.uptime_command.enable",
            type: "checkbox",
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
                type: ["Command", "Keyword", "Script"],
                trigger: "!casterlabs",
                mention: true,
                reply: LANG.getTranslation("caffeinated.chatbot.default_reply")
            }
        },
        enable_uptime_command: true,
        follow_callout: "",
        donation_callout: "",
        welcome_callout: ""
    };

};
