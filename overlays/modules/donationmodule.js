

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
        font: "font",
        font_size: "number",
        text_color: "color",
        volume: "range",
        text_to_speech_voice: "select",
        audio: "select",
        image: "select",
        audio_file: "file",
        image_file: "file"
    };

    defaultSettings = {
        font: "Poppins",
        font_size: "16",
        text_color: "#FFFFFF",
        volume: 1,
        text_to_speech_voice: ["Brian", "Russell", "Nicole", "Amy", "Salli", "Joanna", "Matthew", "Ivy", "Joey"],
        audio: ["Custom Audio", "Text To Speech", "None"],
        image: ["Custom Image", "Donation Image", "None"],
        audio_file: "",
        image_file: ""
    };

};
