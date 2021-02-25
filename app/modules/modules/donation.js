

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
        text_to_speech_voice: {
            display: "caffeinated.donation_alert.text_to_speech_voice",
            type: "select",
            isLang: true
        },
        audio: {
            display: "generic.alert.audio",
            type: "select",
            isLang: true
        },
        image: {
            display: "generic.alert.image",
            type: "select",
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
        text_to_speech_voice: ["Brian", "Russell", "Nicole", "Amy", "Salli", "Joanna", "Matthew", "Ivy", "Joey"],
        audio: ["Custom Audio", "Text To Speech", "Custom Audio & Text To Speech", "None"],
        image: ["Custom Image", "Animated Donation Image", "Donation Image", "None"],
        audio_file: "",
        image_file: ""
    };

};
