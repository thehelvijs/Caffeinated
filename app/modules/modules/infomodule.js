
MODULES.moduleClasses["casterlabs_info"] = class {

    constructor(id) {
        this.namespace = "casterlabs_info";
        this.type = "overlay settings";
        this.id = id;

        if (!this.id.includes("donation")) {
            this.settingsDisplay.format = this.settingsDisplay.format.replace("%amount% ", "");
        }
    }

    widgetDisplay = [
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/info.html?id=" + instance.id);
            }
        },
        {
            name: "Reset",
            icon: "trash",
            onclick(instance) {
                instance.event = {
                    username: "",
                    amount: ""
                };
                MODULES.emitIO(instance, "event", instance.event);
                MODULES.saveToStore(instance);
            }
        }
    ]

    getDataToStore() {
        let data = Object.assign({}, this.settings);

        data.event = this.event;

        return data;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "event", this.event, socket);
    }

    init() {
        const instance = this;

        this.event = this.settings.event;

        if (!this.event) {
            this.event = {
                username: "",
                amount: ""
            };
        }

        if (this.id.includes("follow")) {
            koi.addEventListener("follow", (event) => {
                instance.event = {
                    username: event.follower.username,
                    amount: ""
                };

                MODULES.emitIO(this, "event", instance.event);
                MODULES.saveToStore(instance);
            });
        } else {
            koi.addEventListener("donation", (event) => {
                if (!instance.event || instance.id.includes("recent") || (instance.event.usd_equivalent <= event.usd_equivalent)) {
                    instance.event = {
                        username: event.sender.username,
                        amount: event.currency_info.formatted
                    };

                    MODULES.emitIO(this, "event", instance.event);
                    MODULES.saveToStore(instance);
                }
            });
        }
    }

    async onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        font: "font",
        format: "rich"
    };

    defaultSettings = {
        font: "Poppins",
        format: "<p>%amount% %username%</p>"
    };

};
