
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
        koi.addEventListener("chat", (event) => {
            if (this.settings.enabled) {
                const message = event.message.toLowerCase();

                // We add a character to hide this account's messages, but still allow the broadcaster to run commands
                if (!message.includes("\u200D")) {
                    for (const command of this.settings.commands) {
                        if (command.type = "Command") {
                            if (message.startsWith(command.trigger.toLowerCase())) {
                                if (command.mention) {
                                    this.sendMessage("@" + event.sender.username + " " + command.reply);
                                } else {
                                    this.sendMessage(command.reply);
                                }
                                break;
                            }
                        } else { // Trigger
                            if (message.includes(command.trigger.toLowerCase())) {
                                if (command.mention) {
                                    this.sendMessage("@" + event.sender.username + " " + command.reply);
                                } else {
                                    this.sendMessage(command.reply);
                                }
                                break;
                            }
                        }
                    }
                }
            }
        });
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
                    type: "input",
                    isLang: false
                },
            },
            default: {
                type: ["Command", "Keyword"],
                trigger: "!casterlabs",
                mention: false,
                reply: "Casterlabs is a free stream widget service!"
            }
        }
    };

};
