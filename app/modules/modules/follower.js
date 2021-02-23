
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
                putInClipboard("https://caffeinated.casterlabs.co/alert.html?namespace=" + instance.namespace + "&id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        FileStore.setFile(this, "audio_file", this.audio_file);
        FileStore.setFile(this, "image_file", this.image_file);

        return this.settings;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "audio_file", this.audio_file, socket);
        MODULES.emitIO(this, "image_file", this.image_file, socket);

    }

    init() {
        koi.addEventListener("follow", (event) => {
            const follower = `<span style="color: ${event.follower.color};">${event.follower.displayname}</span>`;

            MODULES.emitIO(this, "event", LANG.getTranslation("caffeinated.follower_alert.format.followed", follower));
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
