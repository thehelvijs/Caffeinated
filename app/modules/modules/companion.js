
MODULES.moduleClasses["casterlabs_companion"] = class {

    constructor(id) {
        this.namespace = "casterlabs_companion";
        this.displayname = "caffeinated.companion.title";
        this.type = "settings";
        this.id = id;
        this.kinoko = new Kinoko();
        this.messageHistory = {};
        this.viewersList = [];

        this.defaultSettings.reset_link = () => {
            this.uuid = generateUnsafeUniquePassword(16);
            this.setLinkText();
            this.connect();
            MODULES.saveToStore(this);
        };

        this.defaultSettings.copy_link = () => {
            putInClipboard(`https://casterlabs.co/companion?key=${this.uuid}`);
        };

        this.kinoko.on("message", (data) => {
            switch (data.type.toLowerCase()) {
                case "connected": {
                    this.sendAll();
                    return;
                }

            }
        });

        koi.addEventListener("chat", (event) => {
            if (event.id === "") {
                event.id = generateUUID();
            }

            event.upvotes = 0;
            event.timestamp = performance.now();

            this.messageHistory[event.id] = event;
            this.sendEvent("chat", event);
        });

        koi.addEventListener("donation", (event) => {
            if (event.id === "") {
                event.id = generateUUID();
            }

            event.upvotes = 0;
            event.timestamp = performance.now();

            this.messageHistory[event.id] = event;
            this.sendEvent("donation", event);
        });

        koi.addEventListener("upvote", (event) => {
            if (!this.messageHistory[event.id]) {
                this.messageHistory[event.id] = event.event;
            }

            this.messageHistory[event.id].upvotes = event.upvotes;
            this.sendEvent("upvote", event);
        });

        koi.addEventListener("follow", (event) => {
            this.sendEvent("follow", event);
        });

        koi.addEventListener("stream_status", (event) => {
            this.sendEvent("stream_status", event);
            this.streamStatus = event;
        });

        koi.addEventListener("user_update", (event) => {
            this.sendEvent("user_update", event);
        });

        koi.addEventListener("viewer_join", (event) => {
            this.sendEvent("join", event.viewer);
        });

        koi.addEventListener("viewer_leave", (event) => {
            this.sendEvent("leave", event.viewer);
        });

        koi.addEventListener("viewer_list", (event) => {
            this.viewersList = event.viewers;

            this.sendEvent("viewers", event.viewers);
            this.sendEvent("viewcount", event.viewers.length);
        });
    }

    sendAll() {
        if (CAFFEINATED.userdata) {
            this.sendEvent("user_update", CAFFEINATED.userdata, true);

            this.sendEvent("stream_status", this.streamStatus, true);

            this.sendEvent("viewcount", this.viewersList.length, true);
            this.sendEvent("viewers", this.viewersList, true);
            // Send join messages
            this.viewersList.forEach((viewer) => {
                this.sendEvent("join", viewer, true);
            });

            this.sendEvent("message_history", Object.values(this.messageHistory), true);
        }
    }

    sendEvent(type, event, isCatchup = false) {
        this.send("event", {
            type: type,
            event: event,
            is_catchup: isCatchup
        });
    }

    send(type, data) {
        this.kinoko.send({
            type: type,
            data: data
        });
    }

    getDataToStore() {
        return {
            uuid: this.uuid,
            enabled: this.settings.enabled
        };
    }

    connect() {
        this.kinoko.disconnect();

        if (this.settings.enabled) {
            this.kinoko.connect("companion:" + this.uuid, "parent");
        }
    }

    setLinkText() {
        this.qrWindow.setCode(`https://casterlabs.co/companion?key=${this.uuid}`);
    }

    init() {
        this.qrWindow = this.page.querySelector("iframe").contentWindow;
        this.uuid = this.settings.uuid;

        if (!this.uuid || this.uuid.includes("-")) {
            this.uuid = generateUnsafeUniquePassword(16);

            MODULES.saveToStore(this);
        }

        this.page.querySelector("iframe").style.marginBottom = "35px";

        // Give the frame time to render.
        setTimeout(() => {
            this.setLinkText();
            this.connect();
        }, 100);
    }


    onSettingsUpdate() {
        this.setLinkText();
        this.connect();
    }

    settingsDisplay = {
        enabled: {
            display: "caffeinated.companion.enabled",
            type: "checkbox",
            isLang: true
        },
        qr_frame: {
            type: "iframe-src",
            height: "175px",
            width: "175px"
        },
        copy_link: {
            display: "caffeinated.companion.copy",
            type: "button",
            isLang: true
        },
        reset_link: {
            display: "caffeinated.companion.reset",
            type: "button",
            isLang: true
        }
    };

    defaultSettings = {
        enabled: false,
        qr_frame: __dirname + "/modules/modules/qr.html",
        // copy_link: () => {},
        // reset_link: () => {}
    };

};
