
MODULES.moduleClasses["casterlabs_chat"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Test",
            icon: "dice",
            onclick(instance) {
                koi.test("chat");
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/chat.html?id=" + instance.id);
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
            MODULES.emitIO(instance, "event", event);
        });

        koi.addEventListener("donation", (event) => {
            if (instance.settings.show_donations) {
                MODULES.emitIO(instance, "event", event);
            }
        });
    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        font: "font",
        font_size: "number",
        text_color: "color",
        show_donations: "checkbox",
        chat_direction: "select",
        chat_animation: "select",
        text_align: "select"
    };

    defaultSettings = {
        font: "Poppins",
        font_size: "16",
        show_donations: true,
        text_color: "#FFFFFF",
        chat_direction: [
            "Down",
            "Up"
        ],
        chat_animation: [
            "Default",
            "Slide",
            "Slide (Disappearing)",
            "Disappearing"
        ],
        text_align: [
            "Left",
            "Right"
        ]
    };

};
