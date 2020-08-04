

MODULES.moduleClasses["casterlabs_donation"] = class {

    constructor(id) {
        this.namespace = "casterlabs_donation";
        this.type = "overlay settings";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/donation.html",
        option: {
            name: "Test",
            onclick(instance) {
                koi.test("casterlabs", "donation");
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
        MODULES.emitIO(this, "audio_file", this.audio_file, socket);
        MODULES.emitIO(this, "image_file", this.image_file, socket);
    }

    init() {
        koi.addEventListener("donation", (event) => {
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
        text_color: "color",
        volume: "range",
        enable_audio: "checkbox",
        use_donation_image: "checkbox",
        audio_file: "file",
        image_file: "file"
    };

    defaultSettings = {
        text_color: "#FFFFFF",
        volume: 1,
        enable_audio: true,
        use_donation_image: false,
        audio_file: "",
        image_file: ""
    };

};
