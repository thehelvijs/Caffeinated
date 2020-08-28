
MODULES.moduleClasses["casterlabs_rotator"] = class {

    constructor(id) {
        this.namespace = "casterlabs_rotator";
        this.type = "overlay settings";
        this.id = id;
        this.scheduled = -1;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/rotator.html",
        option: {
            name: "Test",
            onclick(instance) {
                MODULES.emitIO(instance, "trigger");
            }
        }
    };

    getDataToStore() {
        return this.settings;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
    }

    init() {
        this.schedule();
    }

    schedule() {
        const instance = this;

        this.lastFrequency = this.settings["Frequency (Seconds)"];

        clearTimeout(this.scheduled);

        this.scheduled = setInterval(() => {
            MODULES.emitIO(instance, "trigger");
        }, this.settings["Frequency (Seconds)"] * 1000);

    }

    onSettingsUpdate() {
        if (this.lastFrequency != this.settings["Frequency (Seconds)"]) {
            this.schedule();
        }

        MODULES.emitIO(this, "config", this.settings);
    }


    settingsDisplay = {
        theme: "select",
        "Frequency (Seconds)": "number",
        elements: "dynamic"
    };

    defaultSettings = {
        theme: [
            "Bubbly"
        ],
        "Frequency (Seconds)": 60,
        elements: {
            display: {
                text_color: "color",
                background_color: "color",
                accent_color: "color",
                icon: "select",
                title: "input",
                text: "input",
                "Show for (Seconds)": "number"
            },
            default: {
                text_color: "#FFFFFF",
                background_color: "#9C42FF",
                accent_color: "#FFFFFF",
                icon: [
                    "Twitter",
                    "Facebook",
                    "Snapchat",
                    "Instagram",
                    "Youtube",
                    "Tiktok",
                    "Discord",
                    "Web"
                ],
                title: "Drop a follow",
                text: "@casterlabs",
                "Show for (Seconds)": 10
            }
        }
    };

};
