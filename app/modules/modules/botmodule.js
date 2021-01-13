
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

        koi.addEventListener("user_update", () => this.limitFields());

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

        // We add a character to hide this account's messages, but still allow the broadcaster to run commands.
        if (!message.includes("\u200D")) {
            for (const command of this.settings.commands) {
                const trigger = command.trigger.toLowerCase();

                if (
                    ((command.type == "Command") && message.startsWith(trigger)) ||
                    ((command.type == "Keyword") && message.includes(trigger))
                ) {
                    if (command.mention) {
                        this.sendMessage(`@${event.sender.username} ${command.reply}`);
                    } else {
                        this.sendMessage(command.reply);
                    }
                    break;
                }
            }
        }
    }

    sendMessage(message) {
        if (isPlatform("CAFFEINE")) {
            const length = Math.min(75 - 1, message.length);

            // We have to add some invisible characters to trick Caffeine's chat system into not hiding the broadcaster's messages.
            message = message.substring(0, length) + this.getRandomJoiner();
        } else if (isPlatform("TWITCH")) {
            const length = Math.min(500 - 1, message.length);

            message = message.substring(0, length);
        }

        message += "\u200D";

        koi.sendMessage(message);
    }

    getRandomJoiner() {
        const rand = Math.floor(Math.random() * 5);

        let result = "";

        for (let i = 0; i < rand; i++) {
            result += "\u200D"; // Zero Width Joiner
        }

        return result;
    }

    limitFields() {
        Array.from(this.page.querySelectorAll("[name=reply][owner=chat_bot]")).forEach((element) => {
            if (isPlatform("CAFFEINE")) {
                element.setAttribute("maxlength", 75 - 1);
            } else if (isPlatform("TWITCH")) {
                element.setAttribute("maxlength", 500 - 1);
            }
        })
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
                mention: {
                    display: "Mention",
                    type: "checkbox",
                    isLang: false // TODO
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
