

MODULES.moduleClasses["casterlabs_donation"] = class {

    constructor(id) {
        this.namespace = "casterlabs_donation";
        this.displayname = "caffeinated.donation_alert.title";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Test",
            icon: "dice",
            onclick(instance) {
                koi.test("donation");
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/donation.html?id=" + instance.id);
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
        koi.addEventListener("donation", (event) => {
            for (const donation of event.donations) {
                const converted = Object.assign({
                    image: donation.image,
                    animated_image: donation.animated_image
                }, event);

                MODULES.emitIO(this, "event", converted);

                // Only alert once for Caffeine props
                if (event.sender.platform == "CAFFEINE") {
                    return;
                }
            }
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
            display: "caffeinated.donation_alert.font",
            type: "font",
            isLang: true
        },
        font_size: {
            display: "caffeinated.donation_alert.font_size",
            type: "number",
            isLang: true
        },
        text_color: {
            display: "caffeinated.donation_alert.text_color",
            type: "color",
            isLang: true
        },
        volume: {
            display: "caffeinated.donation_alert.volume",
            type: "range",
            isLang: true
        },
        text_to_speech_voice: {
            display: "caffeinated.donation_alert.text_to_speech_voice",
            type: "select",
            isLang: true
        },
        audio: {
            display: "caffeinated.donation_alert.audio",
            type: "select",
            isLang: true
        },
        image: {
            display: "caffeinated.donation_alert.image",
            type: "select",
            isLang: true
        },
        audio_file: {
            display: "caffeinated.donation_alert.audio_file",
            type: "file",
            isLang: true
        },
        image_file: {
            display: "caffeinated.donation_alert.image_file",
            type: "file",
            isLang: true
        }
    };

    defaultSettings = {
        font: "Poppins",
        font_size: "16",
        text_color: "#FFFFFF",
        volume: 1,
        text_to_speech_voice: ["Brian", "Russell", "Nicole", "Amy", "Salli", "Joanna", "Matthew", "Ivy", "Joey"],
        audio: ["Custom Audio", "Text To Speech", "Custom Audio & Text To Speech", "None"],
        image: ["Custom Image", "Animated Donation Image", "Donation Image", "None"],
        audio_file: "",
        image_file: ""
    };

};
