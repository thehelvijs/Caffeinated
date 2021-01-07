let CAFFEINE_GAMES = {};

(function () {
    let xhr = new XMLHttpRequest();

    xhr.open("GET", "https://api.caffeine.tv/v1/games", false);
    xhr.send(null);

    JSON.parse(xhr.responseText).forEach((game) => {
        CAFFEINE_GAMES[game.name] = game.id;
    });
})();

MODULES.moduleClasses["caffeine_game_picker"] = class {

    constructor(id) {
        this.namespace = "caffeine_game_picker";
        this.displayname = "caffeinated.caffeinegamepicker.title";
        this.type = "settings";
        this.id = id;

        this.schedule = -1;

        const instance = this;

        Object.entries(CAFFEINE_GAMES).forEach(([title, id]) => {
            this.defaultSettings.game.push(title);
        });

        this.defaultSettings.update = () => {
            const form = new FormData();

            form.append("broadcast[game_id]", CAFFEINE_GAMES[this.settings.game]);

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

        if (CAFFEINATED.userdata && (CAFFEINATED.userdata.platform != "CAFFEINE")) {
            div.classList.add("hide");
        }
    }

    settingsDisplay = {
        game: {
            display: "caffeinated.caffeinegamepicker.game",
            type: "search",
            isLang: true
        },
        update: {
            display: "caffeinated.caffeinegamepicker.update",
            type: "button",
            isLang: true
        }
    };

    defaultSettings = {
        game: [],
        // update: function() { }
    };

};
