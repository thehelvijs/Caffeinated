
MODULES.moduleClasses["casterlabs_recent_subscription"] = class {

    constructor(id) {
        this.namespace = "casterlabs_recent_subscription";
        this.displayname = "caffeinated.recent_subscription.title";
        this.type = "overlay settings";
        this.id = id;

    }

    widgetDisplay = [
        {
            name: "Reset",
            icon: "trash",
            async onclick(instance) {
                instance.username = null;
                instance.amount = 0;

                instance.update();
                MODULES.saveToStore(instance);
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/display.html?namespace=" + instance.namespace + "&id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        return Object.assign({
            username: this.username
        }, this.settings);
    }

    onConnection(socket) {
        this.update(socket);
    }

    init() {
        this.username = this.settings.username;

        koi.addEventListener("subscription", async (event) => {
            if (!event.isTest) {
                const profile = event.gift_recipient ?? event.subscriber;

                this.username = profile.displayname;

                MODULES.saveToStore(this);
                this.update();
            }
        });
    }

    async onSettingsUpdate() {
        this.update();
    }

    async update(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);

        if (this.username) {
            MODULES.emitIO(this, "event", `
                <span style="font-size: ${this.settings.font_size}px; color: ${this.settings.text_color};">
                    ${this.username}
                </span>
            `, socket);
        } else {
            MODULES.emitIO(this, "event", "", socket);
        }
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
        currency: {
            display: "generic.currency",
            type: "currency",
            isLang: true
        },
        text_color: {
            display: "generic.text.color",
            type: "color",
            isLang: true
        }
    };

    defaultSettings = {
        font: "Poppins",
        currency: "USD",
        font_size: 24,
        text_color: "#FFFFFF"
    };

};
