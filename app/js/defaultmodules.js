
class DonationModule {

    constructor(id) {
        this.namespace = "casterlabs_donation";
        this.type = "overlay";
        this.id = id;
    }

    linkDisplay = {
        path: "/donation",
        option: {
            name: "Test",
            onclick: function (instance) {
                koi.test("casterlabs", "donation");
            }
        }
    };

    getDataToStore() {
        return this.settings;
    }

    onInit() {
        koi.addEventListener("donation", (event) => {
            MODULES.emitIO(this, "event", event);
        });
    }

    async onSettingsUpdate() {
        if (typeof this.settings.audio_file != "string") {
            this.settings.audio_file = await fileToBase64(this.settings.audio_file.files[0], "audio");
        }
        if (typeof this.settings.image_file != "string") {
            this.settings.image_file = await fileToBase64(this.settings.image_file.files[0], "image");
        }

        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        text_color: "color",
        volume: "range",
        enable_audio: "checkbox",
        enable_image: "checkbox",
        audio_file: "file",
        image_file: "file"
    };

    defaultSettings = {
        text_color: "#FFFFFF",
        volume: 1,
        enable_audio: true,
        enable_image: true,
        audio_file: "",
        image_file: "" // You can't set file values, not even in Electron
    };

}

class CaffeinatedModule {

    constructor(id) {
        this.namespace = "casterlabs_caffeinated";
        this.type = "settings";
        this.persist = true;
        this.id = id;
    }

    async onSettingsUpdate() {
        CAFFEINATED.setUser(this.settings.username);
    }

    settingsDisplay = {
        username: "input"
    };

    defaultSettings = {
        username: ""
    };

}

/* Add modules to registry */
MODULES.moduleClasses["casterlabs_caffeinated"] = CaffeinatedModule;
MODULES.moduleClasses["casterlabs_donation"] = DonationModule;
