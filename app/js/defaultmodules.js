
class DonationModule {
    type = "donation";

    constructor(id) {
        this.id = id;

        this.audioFile = "media/donation.mp3";
        this.imageFile = "media/donation.gif";
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

    setWindowVisbility(visible) {
        if (visible) {
            this.window = new BrowserWindow({
                width: 300,
                height: 300,
                x: this.settings.window_x,
                y: this.settings.window_y,
                transparent: true,
                resizable: false,
                frame: false,
                alwaysOnTop: true
            });

            this.window.loadURL("http://127.0.0.1:8080/donations");
            this.window.setAlwaysOnTop(true, "floating", 1);
            this.window.setVisibleOnAllWorkspaces(true);
        } else {
            this.window.close();
        }
    }

    onInit() {

    }

    onSettingsUpdate() {
        // Since you can't set file values
        if (this.settings.audio_file) {
            let file = document.querySelector("[name=audio_file][owner=" + this.id + "]");
            // this.audioFile = this.settings.audio_file;

            console.log(file);
        }
        if (this.settings.image_file) {
            let file = document.querySelector("[name=image_file][owner=" + this.id + "]");
            // this.imageFile = this.settings.image_file;

            console.log(file);
        }

        console.log(this.settings);
        console.log("audio: " + this.audioFile);
        console.log("image: " + this.imageFile);
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
MODULES.moduleTypes["donation"] = DonationModule;
