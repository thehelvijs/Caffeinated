
MODULES.moduleClasses["casterlabs_donation_ticker"] = class {

    constructor(id) {
        this.namespace = "casterlabs_donation_ticker";
        this.type = "overlay settings";
        this.id = id;
        this.raised = 0;
    }

    widgetDisplay = [
        {
            name: "Reset",
            icon: "trash",
            onclick(instance) {
                instance.raised = 0;
                instance.update();
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/donationticker.html?id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        return this.settings;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "amount", this.raised, socket);
    }

    init() {
        const instance = this;
        koi.addEventListener("donation", (event) => {
            instance.raised += event.usd_equivalent;
            instance.update();
        });
    }

    update() {
        MODULES.emitIO(this, "amount", this.raised);
    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        font: "font",
        font_size: "number",
        text_color: "color",
        currency: "select"
    };

    defaultSettings = {
        font: "Poppins",
        font_size: "16",
        text_color: "#FFFFFF",
        currency: [
            "Caffeine Credits",
            "USD"
        ],
        // overlay_width: 600
    };

};
