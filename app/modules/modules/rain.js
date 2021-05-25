
// TODO lang
MODULES.moduleClasses["casterlabs_rain"] = class {

    constructor(id) {
        this.namespace = "casterlabs_rain";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Test",
            icon: "dice",
            onclick(instance) {
                MODULES.emitIO(instance, "event", {
                    message: "🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉"
                });
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://widgets.casterlabs.co/emoji.html?id=" + instance.id);
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

        koi.addEventListener("chat", (event) => {
            this.addCustomEmotes(event);
            MODULES.emitIO(instance, "event", event);
        });

        koi.addEventListener("donation", (event) => {
            this.addCustomEmotes(event);
            MODULES.emitIO(instance, "event", event);
        });
    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    addCustomEmotes(event) {
        event.custom_emotes = {};

        this.settings.custom_emotes.forEach((emote) => {
            event.custom_emotes[emote.name] = emote.link;
        })
    }

    settingsDisplay = {
        "life_time (Seconds)": "number",
        max_emojis: "number",
        size: "number",
        speed: "range",
        custom_emotes: "dynamic"
    };

    defaultSettings = {
        "life_time (Seconds)": 10,
        max_emojis: 1000,
        size: 20,
        speed: .5,
        custom_emotes: {
            display: {
                name: "input",
                link: "input"
            },
            default: {
                name: "Casterlabs",
                link: "https://assets.casterlabs.co/logo/casterlabs_icon.png"
            }
        }
    };

};
