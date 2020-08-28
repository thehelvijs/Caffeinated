
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
        font: "font",
        font_size: "number",
        text_color: "color",
        icon_color: "color",
        // animation: "select",
        side: "select",
        "Frequency (Seconds)": "number",
        elements: "dynamic"
    };

    defaultSettings = {
        font: "Poppins",
        font_size: "48",
        text_color: "#000000",
        icon_color: "#000000",
        /*animation: [
            "Slide Left",
            "Slide Right",
            "Slide Down",
            "Slide Up"
        ],*/
        side: [
            "Left",
            "Right"
        ],
        "Frequency (Seconds)": 60,
        elements: {
            display: {
                icon: "select",
                text: "input",
                "Show for (Seconds)": "number"
            },
            default: {
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
                text: "Example message.",
                "Show for (Seconds)": 10
            }
        }
    };

};
