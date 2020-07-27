
MODULES.moduleClasses["casterlabs_chat"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat";
        this.type = "overlay settings";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/chat.html",
        option: {
            name: "Test",
            onclick(instance) {
                koi.test("casterlabs", "chat");
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
        const instance = this;

        koi.addEventListener("chat", (event) => {
            MODULES.emitIO(this, "event", event);
        });

        koi.addEventListener("share", (event) => {
            MODULES.emitIO(this, "event", event);
        });

        koi.addEventListener("donation", (event) => {
            if (instance.settings.show_donations) {
                MODULES.emitIO(this, "event", event);
            }
        });
    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        text_color: "color",
        show_donations: "checkbox",
        //overlay_width: "number"
    };

    defaultSettings = {
        text_color: "#FFFFFF",
        show_donations: "true",
        //overlay_width: 600
    };

};
