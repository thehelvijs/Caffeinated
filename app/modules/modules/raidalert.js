
MODULES.moduleClasses["casterlabs_raid"] = class {

    constructor(id) {
        this.namespace = "casterlabs_raid";
        this.displayname = "caffeinated.raid_alert.title";
        this.type = "overlay settings";
        this.id = id;
        this.supportedPlatforms = ["TWITCH", "TROVO", "BRIME"];
    }

    widgetDisplay = [
        {
            name: "Test",
            icon: "dice",
            onclick(instance) {
                koi.test("raid");
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/alert.html?namespace=" + instance.namespace + "&id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        FileStore.setFile(this, "audio_file", this.audio_file);
        FileStore.setFile(this, "image_file", this.image_file);

        return nullFields(this.settings, ["audio_file", "image_file"]);
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "audio_file", this.audio_file, socket);
        MODULES.emitIO(this, "image_file", this.image_file, socket);

    }

    init() {
        koi.addEventListener("raid", (event) => {
            MODULES.emitIO(
                this,
                "event",
                `<span style="color: ${event.host.color};">${event.host.displayname}</span> just raided with <span style="color: ${event.host.color};">${event.viewers}</span> ${event.viewers == 1 ? "viewer" : "viewers"}`
            );
        });

        if (this.settings.audio_file) {
            this.audio_file = this.settings.audio_file;
            delete this.settings.audio_file;

            MODULES.saveToStore(this);
        } else {
            this.audio_file = FileStore.getFile(this, "audio_file", this.audio_file);
        }

        if (this.settings.image_file) {
            this.image_file = this.settings.image_file;
            delete this.settings.image_file;

            MODULES.saveToStore(this);
        } else {
            this.image_file = FileStore.getFile(this, "image_file", this.image_file);
        }
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
        },
        volume: {
            display: "generic.volume",
            type: "range",
            isLang: true
        },
        enable_audio: {
            display: "generic.enable_audio",
            type: "checkbox",
            isLang: true
        },
        use_custom_image: {
            display: "generic.use_custom_image",
            type: "checkbox",
            isLang: true
        },
        audio_file: {
            display: "generic.audio.file",
            type: "file",
            isLang: true
        },
        image_file: {
            display: "generic.image.file",
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
