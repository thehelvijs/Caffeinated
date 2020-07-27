
MODULES.moduleClasses["casterlabs_info"] = class {

    constructor(id) {
        this.namespace = "casterlabs_info";
        this.type = "overlay settings";
        this.id = id;

        if (this.id.includes("donation")) {
            this.settingsDisplay.currency = "select";
            this.defaultSettings.currency = ["Default", "USD"];
        }
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/info.html",
        option: {
            name: "Reset",
            onclick(instance) {
                instance.event = null;
                MODULES.emitIO(instance, "event", null);
                MODULES.saveToStore(instance);
            }
        }
    };

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

        if (this.id.includes("follow")) {
            koi.addEventListener("follow", (event) => {
                instance.event = event;

                MODULES.emitIO(this, "event", event);
                MODULES.saveToStore(instance);
            });
        } else {
            koi.addEventListener("donation", (event) => {
                if ((instance.id == "recentdonation") || !instance.event || (instance.event.usd_equivalent <= event.usd_equivalent)) {
                    instance.event = event;

                    MODULES.emitIO(this, "event", event);
                    MODULES.saveToStore(instance);
                }
            });
        }

        koi.addEventListener("userupdate", (event) => {
            if (instance.event.streamer.uuid != event.streamer.uuid) {
                instance.event = null;
                MODULES.emitIO(instance, "event", null);
                MODULES.saveToStore(instance);
            }
        });
    }

    async onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        // currency: "select",
        text_color: "color"
    };

    defaultSettings = {
        // currency: ["default", "usd"],
        text_color: "#FFFFFF"
    };

};
