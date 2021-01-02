
MODULES.moduleClasses["caffeine_broadcast_image"] = class {

    constructor(id) {
        this.namespace = "caffeine_broadcast_image";
        this.type = "settings";
        this.id = id;

        this.schedule = -1;

        const instance = this;

        this.defaultSettings.update = () => {
            if (this.settings.new_thumbnail.files.length > 0) {
                const form = new FormData();

                form.append("broadcast[game_image]", this.settings.new_thumbnail.files[0]);

                fetch("https://api.caffeine.tv/v1/users/" + CAFFEINATED.userdata.streamer.UUID)
                    .then((response) => response.json())
                    .then((profileData) => {
                        if (instance.schedule != -1) {
                            clearInterval(instance.schedule);
                            instance.schedule = -1;
                        }

                        let task = () => {
                            koi.getCredentials().then((credentials) => {
                                fetch("https://api.caffeine.tv/v1/broadcasts/" + profileData.user.broadcast_id, {
                                    method: "PATCH",
                                    headers: {
                                        "Authorization": credentials.authorization
                                    },
                                    body: form
                                });
                            }).catch(() => {
                                clearInterval(instance.schedule);
                            });
                        };

                        task();

                        instance.schedule = setInterval(task, (15 * 60) * 1000);
                    });
            }
        };
    }

    init() {
        const div = document.getElementById(this.namespace + "_" + this.id).parentElement;

        koi.addEventListener("user_update", (event) => {
            // Hide the Caffeine settings box if not on Caffeine
            if (event.streamer.platform == "CAFFEINE") {
                div.classList.remove("hide");
            } else {
                div.classList.add("hide");
            }
        });

        koi.addEventListener("stream_status", (event) => {
            if (event.live) {
                this.defaultSettings.update();
            }
        });

        if (CAFFEINATED.userdata && (CAFFEINATED.userdata.platform != "CAFFEINE")) {
            div.classList.add("hide");
        }
    }

    settingsDisplay = {
        new_thumbnail: "file",
        update: "button"
    };

    defaultSettings = {
        new_thumbnail: "",
        // update: function() { }
    };

};
