
MODULES.moduleClasses["caffeine_integration"] = class {

    constructor(id) {
        this.namespace = "caffeine_integration";
        this.displayname = "caffeine.integration.title";
        this.type = "settings";
        this.id = id;

        this.schedule = -1;

        const RATINGS = {
            "Mature": "M",
            "PG": "PG",
            "Unrated": "UNRATED"
        };

        const GAMES = {
            "Entertainment": 79 // Unsure how to go about this, so I just set it to OBS
        };

        this.defaultSettings.game.push("Entertainment");

        (() => {
            const xhr = new XMLHttpRequest();

            xhr.open("GET", "https://api.caffeine.tv/v1/games", false);
            xhr.send(null);

            JSON.parse(xhr.responseText).forEach((game) => {
                GAMES[game.name] = game.id;
                this.defaultSettings.game.push(game.name);
            });
        })();

        this.defaultSettings.update = () => {
            const form = new FormData();

            // Have to do this for the client to display it as 17+
            const title = (this.settings.rating === "Mature") ? ("[17+] " + this.settings.title) : this.settings.title;
            const rating = RATINGS[this.settings.rating];

            form.append("broadcast[game_id]", GAMES[this.settings.game]);
            form.append("broadcast[name]", title);
            form.append("broadcast[content_rating]", rating);

            if (this.settings.new_thumbnail.files && (this.settings.new_thumbnail.files.length > 0)) {
                form.append("broadcast[game_image]", this.settings.new_thumbnail.files[0]);
            }

            this.getBroadcastId().then((broadcastId) => {
                if (this.schedule != -1) {
                    clearInterval(this.schedule);
                    this.schedule = -1;
                }

                const task = () => {
                    koi.getCredentials().then((credentials) => {
                        fetch("https://api.caffeine.tv/v1/broadcasts/" + broadcastId, {
                            method: "PATCH",
                            headers: {
                                "Authorization": credentials.authorization
                            },
                            body: form
                        });
                    }).catch(() => {
                        clearInterval(this.schedule);
                    });
                };

                this.schedule = setInterval(task, (5 * 60) * 1000); // Every 5 minutes

                task();
            });
        };
    }

    getBroadcastId() {
        return new Promise((resolve) => {
            fetch("https://api.caffeine.tv/v1/users/" + CAFFEINATED.userdata.streamer.UUID)
                .then((response) => response.json())
                .then((profileData) => {
                    resolve(profileData.user.broadcast_id);
                });
        });
    }

    getDataToStore() {
        return this.settings;
    }

    onSettingsUpdate() {
        this.updated = true;
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

        if (CAFFEINATED.userdata && (CAFFEINATED.userdata.platform != "CAFFEINE")) {
            div.classList.add("hide");
        }

    }

    settingsDisplay = {
        game: {
            display: "caffeine.integration.game_selector",
            type: "search",
            isLang: true
        },
        rating: {
            display: "caffeine.integration.rating_selector",
            type: "select",
            isLang: true
        },
        title: {
            display: "caffeine.integration.title_selector",
            type: "input",
            isLang: true
        },
        new_thumbnail: {
            display: "caffeine.integration.new_thumbnail",
            type: "file",
            isLang: true
        },
        update: {
            display: "caffeine.integration.update",
            type: "button",
            isLang: true
        }
    };

    defaultSettings = {
        game: [],
        rating: [
            "Mature",
            "PG",
            "Unrated"
        ],
        title: "LIVE on Caffeine!",
        // update: function() { }
    };

};
