
MODULES.moduleClasses["casterlabs_follower"] = class {

    constructor(id) {
        this.namespace = "casterlabs_follower";
        this.type = "overlay settings";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/follower.html",
        option: {
            name: "Test",
            onclick(instance) {
                koi.test("casterlabs", "follow");
            }
        }
    };

    getDataToStore() {
        let data = Object.assign({}, this.settings);

        data.audio_file = this.audio_file;
        data.image_file = this.image_file;

        return data;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", nullFields(this.settings, ["audio_file", "image_file"]), socket);

        if (this.audio_file) {
            MODULES.emitIO(this, "audio_file", this.audio_file);
        }

        if (this.image_file) {
            MODULES.emitIO(this, "image_file", this.image_file);
        }
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
            this.image_file = await fileToBase64(this.settings.image_file, "image");

            MODULES.emitIO(this, "image_file", this.image_file);
        }
    }

    settingsDisplay = {
        text_color: "color",
        volume: "range",
        enable_audio: "checkbox",
        use_custom_image: "checkbox",
        audio_file: "file",
        image_file: "file"
    };

    defaultSettings = {
        text_color: "#FFFFFF",
        volume: 1,
        enable_audio: true,
        use_custom_image: true,
        audio_file: "",
        image_file: ""
    };

};
