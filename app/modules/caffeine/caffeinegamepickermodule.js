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

            fetch("https://api.caffeine.tv/v1/users/" + CAFFEINE.credential.caid, {
                method: "GET"
            }).then((response) => response.json()).then((user) => {
                if (instance.schedule != -1) {
                    clearInterval(instance.schedule);
                    instance.schedule = -1;
                }

                let task = () => {
                    fetch("https://api.caffeine.tv/v1/broadcasts/" + user.user.broadcast_id, {
                        method: "PATCH",
                        headers: {
                            "Authorization": "Bearer " + CAFFEINE.credential.access_token
                        },
                        body: form
                    });
                };

                task();

                instance.schedule = setInterval(task, (15 * 60) * 1000);
            });
        };
    }

    init() {
        const div = document.getElementById(this.namespace + "_" + this.id).parentElement;

        STREAM_INTEGRATION.addEventListener("platform", (platform) => {
            // Hide the Caffeine settings box if not on Caffeine
            if (platform == "CAFFEINE") {
                div.classList.remove("hide");
            } else {
                div.classList.add("hide");
            }
        });
    }

    settingsDisplay = {
        game: "search",
        update: "button"
    };

    defaultSettings = {
        game: [],
        // update: function() { }
    };

};
