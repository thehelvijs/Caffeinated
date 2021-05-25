

MODULES.moduleClasses["casterlabs_donation"] = class {

    constructor(id) {
        this.namespace = "casterlabs_donation";
        this.displayname = "caffeinated.donation_alert.title";
        this.type = "overlay settings";
        this.id = id;
        this.supportedPlatforms = ["TWITCH", "CAFFEINE", "TROVO"];
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
        return nullFields(this.settings, ["audio_file", "image_file"]);
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "audio_file", this.audio_file, socket);
        MODULES.emitIO(this, "image_file", this.image_file, socket);
    }

    init() {
        this.iframeWindow = this.page.querySelector("iframe").contentWindow;
        this.iframeDocument = this.iframeWindow.document;

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

            FileStore.setFile(this, "audio_file", this.audio_file);
        } else {
            this.audio_file = FileStore.getFile(this, "audio_file", this.audio_file);
        }

        if (this.settings.image_file) {
            this.image_file = this.settings.image_file;
            delete this.settings.image_file;

            FileStore.setFile(this, "image_file", this.image_file);
        } else {
            this.image_file = FileStore.getFile(this, "image_file", this.image_file);
        }

        this.iframeDocument.addEventListener("draggable_save", () => {
            MODULES.saveToStore(this);
        });

        this.iframeDocument.addEventListener("draggable_update", (e) => {
            const update = e.detail;

            this.settings.draggable_positions[update.type] = update;

            MODULES.emitIO(this, "draggable_update", this.settings.draggable_positions);
        });

        // Give the frame time to render.
        setTimeout(() => {
            this.iframeWindow.init(this.settings);
            this.updateIframe();
            this.iframeWindow.updateImage(this.settings, this.image_file);
        }, 5000);

        setInterval(() => {
            // Randomize the displayed user.
            this.updateIframeText();
        }, 10000);
    }

    async onSettingsUpdate() {
        const nulled = nullFields(this.settings, ["audio_file", "image_file"]);

        MODULES.emitIO(this, "config", nulled);

        if (this.settings.audio_file?.files.length > 0) {
            this.audio_file = await fileToBase64(this.settings.audio_file, "audio");
            this.settings.audio_file = null;

            MODULES.emitIO(this, "audio_file", this.audio_file);
            FileStore.setFile(this, "audio_file", this.audio_file);
        }

        if (this.settings.image_file?.files.length > 0) {
            this.image_file = await fileToBase64(this.settings.image_file);
            this.settings.image_file = null;

            MODULES.emitIO(this, "image_file", this.image_file);
            FileStore.setFile(this, "image_file", this.image_file);
        }

        this.iframeWindow.updateImage(nulled, this.image_file);
        this.updateIframe();
    }

    updateIframeText() {
        const viewers = [...CAFFEINATED.viewerList];

        // Add Casterlabs to the mix, incase they don't have any viewers
        viewers.push({
            color: "#ea4c4c",
            displayname: "Casterlabs"
        });

        const viewer = viewers[Math.floor(Math.random() * viewers.length)];

        const translated = `<span style="color: ${viewer.color};">${viewer.displayname}</span><br>Have some candy! <img class="emote" title="Party100" src="https://d3aqoihi2n8ty8.cloudfront.net/actions/party/light/animated/100/4.gif">`;

        this.iframeWindow.updateText(translated);
    }

    updateIframe() {
        this.iframeWindow.update(this.settings);
        this.updateIframeText();
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
        },
        editor_frame: {
            type: "iframe-src",
            style: "margin-top: 1em; width: 100%; padding-bottom: 100%;"
        }
    };

    defaultSettings = {
        font: "Poppins",
        font_size: 30,
        text_color: "#FFFFFF",
        volume: 1,
        text_to_speech_voice: ["Brian", "Russell", "Nicole", "Amy", "Salli", "Joanna", "Matthew", "Ivy", "Joey"],
        audio: ["Custom Audio", "Text To Speech", "Custom Audio & Text To Speech", "None"],
        image: ["Custom Image", "Animated Donation Image", "Donation Image", "None"],
        audio_file: "",
        image_file: "",

        editor_frame: __dirname + "/modules/modules/alert_editor.html",

        draggable_positions: {
            alert_text: {
                type: "alert_text",
                width: 0.65,
                height: 0.1,
                posX: 0.175,
                posY: 0.5
            },
            alert_image: {
                type: "alert_image",
                width: 0.65,
                height: 0.35,
                posX: 0.175,
                posY: 0.12
            }
        }
    };

};
