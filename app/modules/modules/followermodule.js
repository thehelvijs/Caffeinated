
MODULES.moduleClasses["casterlabs_follower"] = class {

    constructor(id) {
        this.namespace = "casterlabs_follower";
        this.displayname = "caffeinated.follower_alert.title";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Test",
            icon: "dice",
            onclick(instance) {
                koi.test("follow");
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/follower.html?id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        let data = Object.assign({}, this.settings);

        data.audio_file = this.audio_file;
        data.image_file = this.image_file;

        return data;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", nullFields(this.settings, ["audio_file", "image_file"]), socket);
        MODULES.emitIO(this, "audio_file", this.audio_file, socket);
        MODULES.emitIO(this, "image_file", this.image_file, socket);

    }

    init() {
        koi.addEventListener("follow", (event) => {
            MODULES.emitIO(this, "event", event);
        });

        this.audio_file = this.settings.audio_file;
        this.image_file = this.settings.image_file;
    }

    async onSettingsUpdate() {
        MODULES.emitIO(this, "config", nullFields(this.settings, ["audio_file", "image_file"]));

        if (this.settings.audio_file.files.length > 0) {
            this.audio_file = await fileToBase64(this.settings.audio_file, "audio");

            MODULES.emitIO(this, "audio_file", this.audio_file);
        }

        if (this.settings.image_file.files.length > 0) {
            this.image_file = await fileToBase64(this.settings.image_file);

            MODULES.emitIO(this, "image_file", this.image_file);
        }
    }

    settingsDisplay = {
        font: {
            display: "caffeinated.follower_alert.font",
            type: "font",
            isLang: true
        },
        font_size: {
            display: "caffeinated.follower_alert.font_size",
            type: "number",
            isLang: true
        },
        text_color: {
            display: "caffeinated.follower_alert.text_color",
            type: "color",
            isLang: true
        },
        volume: {
            display: "caffeinated.follower_alert.volume",
            type: "range",
            isLang: true
        },
        enable_audio: {
            display: "caffeinated.follower_alert.enable_audio",
            type: "checkbox",
            isLang: true
        },
        use_custom_image: {
            display: "caffeinated.follower_alert.use_custom_image",
            type: "checkbox",
            isLang: true
        },
        audio_file: {
            display: "caffeinated.follower_alert.audio_file",
            type: "file",
            isLang: true
        },
        image_file: {
            display: "caffeinated.follower_alert.image_file",
            type: "file",
            isLang: true
        }
    };

    defaultSettings = {
        font: "Poppins",
        font_size: "16",
        text_color: "#FFFFFF",
        volume: 1,
        enable_audio: true,
        use_custom_image: true,
        audio_file: "",
        image_file: ""
    };

};
