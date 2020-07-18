
class DonationModule {
    namespace = "casterlabs_donation";

    constructor(id) {
        this.id = id;
    }

    linkDisplay = {
        path: "/donation",
        option: {
            name: "Test",
            onclick: function () { }
        }
    };

    getDataToStore() {
        let store = Object.assign({}, this.settings); // Clone

        store.audio_file = this.audioFile;
        store.image_file = this.imageFile;
        store.window_x = this.window.getNormalBounds();
        store.window_y = this.window.getNormalBounds();

        return store;
    }

    settingsDisplay = {
        color: "color",
        volume: "range",
        enable_audio: "checkbox",
        enable_image: "checkbox",
        audio_file: "file",
        image_file: "file"
    };

    onInit() {
        koi.addEventListener("donation", (event) => {
            MODULES.emitIO(this, "event", event);
        });
    }

    async onSettingsUpdate() {
        // Since you can't set file values
        if ((typeof this.settings.audio_file != "string") && (this.settings.audio_file.files.length > 0)) {
            this.settings.audio_file = await fileToBase64(this.settings.audio_file);
        }
        if ((typeof this.settings.image_file != "string") && (this.settings.image_file.files.length > 0)) {
            this.settings.image_file = await fileToBase64(this.settings.audio_file);
        }

        MODULES.emitIO(this, "config", this.settings);
    }

    defaultSettings = {
        color: "#FFFFFF",
        volume: .5,
        enable_audio: true,
        enable_image: true,
        audio_file: "",
        image_file: "" // You can't set file values, not even in Electron
    };

}

/* Add modules to registry */
MODULES.moduleTypes["casterlabs_donation"] = DonationModule;
