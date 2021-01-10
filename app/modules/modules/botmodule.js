
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
        const instance = this;

        koi.addEventListener("chat", (event) => {
            const message = event.message.toLowerCase();

            // We add a character to hide this account's messages, but still allow the broadcaster to run commands
            if (!message.includes("\u200D")) {
                for (const command of this.settings.commands) {
                    if (command.type = "Command") {
                        if (message.startsWith(command.trigger.toLowerCase())) {
                            this.sendMessage(command.reply);
                            break;
                        }
                    } else { // Trigger
                        if (message.includes(command.trigger.toLowerCase())) {
                            this.sendMessage(command.reply);
                            break;
                        }
                    }
                }
            }
        });
    }

    sendMessage(message) {
        // We have to add some invisible characters to trick Caffeine's chat system into not hiding the broadcaster's messages.
        if (isPlatform("CAFFEINE")) {
            const length = Math.min(75, message.length);

            message = message.substring(0, length) + this.getRandomJoiner();
        }

        message += "\u200D";

        koi.sendMessage(message);
    }

    getRandomJoiner() {
        const rand = Math.floor(Math.random() * 4);

        let result = "";

        for (let i = 0; i < rand; i++) {
            result += "\u200D"; // Zero Width Joiner
        }

        return result;
    }

    settingsDisplay = {
        commands: {
            display: "Commands",
            type: "dynamic",
            isLang: false // TODO
        }
    };

    defaultSettings = {
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
                    type: "input",
                    isLang: false
                },
            },
            default: {
                type: ["Command", "Keyword"],
                trigger: "!casterlabs",
                reply: "Casterlabs is a free stream widget service! Grab it from casterlabs.co"
            }
        }
    };

};
