
class FollowerModule {

    constructor(id) {
        this.namespace = "casterlabs_follower";
        this.type = "overlay";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/follower.html",
        option: {
            name: "Test",
            onclick: function (instance) {
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

}

class DonationModule {

    constructor(id) {
        this.namespace = "casterlabs_donation";
        this.type = "overlay";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/donation.html",
        option: {
            name: "Test",
            onclick: function (instance) {
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

        if (this.audio_file) {
            MODULES.emitIO(this, "audio_file", this.audio_file);
        }

        if (this.image_file) {
            MODULES.emitIO(this, "image_file", this.image_file);
        }
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

}

class InfoModule {

    constructor(id) {
        this.namespace = "casterlabs_info";
        this.type = "overlay";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/info.html",
        option: {
            name: "Reset",
            onclick: function (instance) {
                instance.event = null;
                MODULES.emitIO(instance, "event", null);
                MODULES.saveToStore(instance);
            }
        }
    };

    getDataToStore() {
        let data = Object.assign({}, this.settings);

        data.event = this.event;

        return data;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "event", this.event, socket);
    }

    init() {
        const instance = this;

        this.event = this.settings.event;

        if (this.id.includes("follow")) {
            koi.addEventListener("follow", (event) => {
                instance.event = event;

                MODULES.emitIO(this, "event", event);
                MODULES.saveToStore(instance);
            });
        } else {
            koi.addEventListener("donation", (event) => {
                if ((instance.id == "recentdonation") || !instance.event || (instance.event.usd_equivalent <= event.usd_equivalent)) {
                    instance.event = event;

                    MODULES.emitIO(this, "event", event);
                    MODULES.saveToStore(instance);
                }
            });
        }

        koi.addEventListener("userupdate", (event) => {
            if (instance.event.streamer.uuid != event.streamer.uuid) {
                instance.event = null;
                MODULES.emitIO(instance, "event", null);
                MODULES.saveToStore(instance);
            }
        });
    }

    async onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        // currency: "select",
        text_color: "color"
    };

    defaultSettings = {
        // currency: ["default", "usd"],
        text_color: "#FFFFFF"
    };

}

class ChatModule {

    constructor(id) {
        this.namespace = "casterlabs_chat";
        this.type = "overlay";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/chat.html",
        option: {
            name: "Test",
            onclick: function (instance) {
                koi.test("casterlabs", "chat");
            }
        }
    };

    getDataToStore() {
        return this.settings;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
    }

    init() {
        koi.addEventListener("chat", (event) => {
            MODULES.emitIO(this, "event", event);
        });

        koi.addEventListener("share", (event) => {
            MODULES.emitIO(this, "event", event);
        });

        koi.addEventListener("donation", (event) => {
            MODULES.emitIO(this, "event", event);
        });
    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        text_color: "color",
        //overlay_width: "number"
    };

    defaultSettings = {
        text_color: "#FFFFFF",
        //overlay_width: 600
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
        if (this.settings.username == "reset") {
            CAFFEINATED.reset();
        } else {
            CAFFEINATED.setUser(this.settings.username);
        }
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
MODULES.moduleClasses["casterlabs_follower"] = FollowerModule;
MODULES.moduleClasses["casterlabs_chat"] = ChatModule;
MODULES.moduleClasses["casterlabs_info"] = InfoModule;
