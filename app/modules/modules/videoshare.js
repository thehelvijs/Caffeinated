
MODULES.moduleClasses["casterlabs_video_share"] = class {

    constructor(id) {
        this.namespace = "casterlabs_video_share";
        this.displayname = "caffeinated.videoshare.title";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/videoshare.html?id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        return this.settings;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
    }

    init() {
        const instance = this;

        koi.addEventListener("donation", (event) => {
            MODULES.emitIO(instance, "event", event);
        });

        koi.addEventListener("chat", (event) => {
            MODULES.emitIO(instance, "event", event);
        });

    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        bar_color: {
            display: "caffeinated.generic_goal.bar_color",
            type: "color",
            isLang: true
        },
        background_color: {
            display: "generic.background.color",
            type: "color",
            isLang: true
        },
        donations_only: {
            display: "caffeinated.videoshare.donations_only",
            type: "checkbox",
            isLang: true
        },
        volume: {
            display: "generic.volume",
            type: "range",
            isLang: true
        },
        skip: {
            display: "caffeinated.videoshare.skip",
            type: "button",
            isLang: true
        },
        pause: {
            display: "caffeinated.videoshare.pause",
            type: "button",
            isLang: true
        }
    };

    defaultSettings = {
        bar_color: "#7a7a7a",
        background_color: "#202020",
        donations_only: false,
        volume: .5,
        skip: () => {
            MODULES.emitIO(this, "skip", null);
        },
        pause: () => {
            MODULES.emitIO(this, "pause", null);
        }
    };

};
