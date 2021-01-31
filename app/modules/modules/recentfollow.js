
MODULES.moduleClasses["casterlabs_recent_follow"] = class {

    constructor(id) {
        this.namespace = "casterlabs_recent_follow";
        this.displayname = "caffeinated.recent_follow.title";
        this.type = "overlay settings";
        this.id = id;

    }

    widgetDisplay = [
        {
            name: "Reset",
            icon: "trash",
            async onclick(instance) {
                instance.username = null;

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

        if (this.username === undefined) {
            this.username = "";
        }

        koi.addEventListener("follow", (event) => {
            if (!event.isTest) {
                this.username = event.follower.username;

                MODULES.saveToStore(this);
                this.update();
            }
        });
    }

    async onSettingsUpdate() {
        this.update();
    }

    update(socket) {
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
        text_color: {
            display: "generic.text.color",
            type: "color",
            isLang: true
        }
    };

    defaultSettings = {
        font: "Poppins",
        font_size: 24,
        text_color: "#FFFFFF"
    };

};
