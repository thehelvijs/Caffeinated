
MODULES.moduleClasses["casterlabs_view_counter"] = class {

    constructor(id) {
        this.namespace = "casterlabs_view_counter";
        this.displayname = "caffeinated.view_counter.title";
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
        this.update(socket);
    }

    init() {
        this.count = 0;

        koi.addEventListener("viewer_list", (event) => {
            this.count = event.viewers.length;

            this.update();
        });
    }

    async onSettingsUpdate() {
        this.update();
    }

    update(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "event", `
            <span style="font-size: ${this.settings.font_size}px; color: ${this.settings.text_color};">
                ${this.count}
            </span>
        `, socket);
    }

    settingsDisplay = {
        font: {
            display: "caffeinated.view_counter.font",
            type: "font",
            isLang: true
        },
        font_size: {
            display: "caffeinated.view_counter.font_size",
            type: "number",
            isLang: true
        },
        text_color: {
            display: "caffeinated.view_counter.text_color",
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
