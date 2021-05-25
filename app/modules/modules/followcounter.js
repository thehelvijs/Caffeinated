
MODULES.moduleClasses["casterlabs_follow_counter"] = class {

    constructor(id) {
        this.namespace = "casterlabs_follow_counter";
        this.displayname = "caffeinated.follow_counter.title";
        this.type = "overlay settings";
        this.id = id;

    }

    widgetDisplay = [
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://widgets.casterlabs.co/display.html?namespace=" + instance.namespace + "&id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        return this.settings;
    }

    onConnection(socket) {
        this.update(socket);
    }

    init() {
        koi.addEventListener("user_data", (event) => {
            this.update(null, event);
        });
    }

    async onSettingsUpdate() {
        this.update();
    }

    update(socket, userdata = CAFFEINATED.userdata) {
        MODULES.emitIO(this, "config", this.settings, socket);

        if (userdata) {
            MODULES.emitIO(this, "event", `
                <span style="font-size: ${this.settings.font_size}px; color: ${this.settings.text_color};">
                    ${userdata.streamer.followers_count}
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
