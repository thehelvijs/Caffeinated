
MODULES.moduleClasses["casterlabs_follower"] = class {

    constructor(id) {
        this.namespace = "casterlabs_follower";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/follower.html?id=" + instance.id);
            }
        },
        {
            name: "Test",
            icon: "dice",
            onclick(instance) {
                koi.test("follow");
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
        font: "font",
        font_size: "number",
        text_color: "color",
        volume: "range",
        enable_audio: "checkbox",
        use_custom_image: "checkbox",
        audio_file: "file",
        image_file: "file"
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
