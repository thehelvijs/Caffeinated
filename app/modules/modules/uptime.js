
MODULES.moduleClasses["casterlabs_uptime"] = class {

    constructor(id) {
        this.namespace = "casterlabs_uptime";
        this.displayname = "caffeinated.uptime.title";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/display.html?namespace=" + instance.namespace + "&id=" + instance.id);
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
        setInterval(() => this.update(), 1000);
    }

    async onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    async update() {
        const delta =
            (CAFFEINATED.streamdata && CAFFEINATED.streamdata.is_live) ?
                (new Date() - new Date(CAFFEINATED.streamdata.start_time)) : 0;

        MODULES.emitIO(this, "event", `
            <span style="font-size: ${this.settings.font_size}px; color: ${this.settings.text_color};">
                ${getFriendlyTime(delta)}
            </span>
        `);
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
