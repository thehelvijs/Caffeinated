
MODULES.moduleClasses["casterlabs_now_playing"] = class {

    constructor(id) {
        this.namespace = "casterlabs_now_playing";
        this.displayname = "spotify.integration.title"
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/nowplaying.html?id=" + instance.id);
            }
        }
    ]

    async setToken(code) {
        const response = await fetch("https://api.casterlabs.co/v2/natsukashii/spotify?code=" + code);
        const authResult = await response.json();

        if (!authResult.error) {
            this.statusElement.innerText = LANG.getTranslation("spotify.integration.logging_in");

            this.refreshToken = authResult.refresh_token;

            MODULES.saveToStore(this);
        } else {
            this.settings.token = null;
            this.statusElement.innerText = LANG.getTranslation("spotify.integration.login");
        }
    }

    getDataToStore() {
        const data = Object.assign({}, this.settings);

        data.token = this.refreshToken;

        return data;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);

        if (this.event) {
            MODULES.emitIO(this, "event", this.event, socket);
        }
    }

    init() {
        if (this.settings.token) {
            this.refreshToken = this.settings.token;
            this.settings.token = null;
            this.check();
        }

        koi.addEventListener("chat", (event) => {
            this.processCommand(event);
        });

        koi.addEventListener("donation", (event) => {
            this.processCommand(event);
        });

        setInterval(() => this.check(), 2000);

        const element = document.querySelector("#casterlabs_now_playing_" + this.id).querySelector("[name=login]");

        element.style = "overflow: hidden; background-color: rgb(30, 215, 96); margin-top: 15px;";
        element.innerHTML = `
            <img src="https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png" style="height: 3.5em; position: absolute; left: -5px;" />
            <span style="padding-left: 1.75em; z-index: 2;" name="text">${LANG.getTranslation("spotify.integration.login")}</span>
        `;

        this.statusElement = element.querySelector("[name=text]");
    }

    processCommand(event) {
        const message = event.message.toLowerCase();

        if (message.startsWith("!song")) {
            if (this.settings.enable_song_command) {
                koi.sendMessage(`@${event.sender.displayname} ${this.event.title} - ${this.event.artist}`, event, "PUPPET");
            }
        }
    }

    async check() {
        if (this.refreshToken) {
            if (!this.accessToken) {
                const auth = await (await fetch("https://api.casterlabs.co/v2/natsukashii/spotify?refresh_token=" + this.refreshToken)).json();

                if (auth.error) {
                    this.refreshToken = null;
                    this.statusElement.innerText = LANG.getTranslation("spotify.integration.login");
                } else {
                    this.statusElement.innerText = LANG.getTranslation("spotify.integration.logging_in");

                    this.accessToken = auth.access_token;
                    if (auth.refresh_token) {
                        this.refreshToken = auth.refresh_token;
                    }

                    const profile = await (await fetch("https://api.spotify.com/v1/me", {
                        headers: {
                            "content-type": "application/json",
                            authorization: "Bearer " + this.accessToken
                        }
                    })).json();

                    this.statusElement.innerText = LANG.getTranslation("spotify.integration.logged_in_as", profile.display_name);
                }

                MODULES.saveToStore(this);
            }

            const response = await fetch("https://api.spotify.com/v1/me/player", {
                headers: {
                    "content-type": "application/json",
                    authorization: "Bearer " + this.accessToken
                }
            });

            if ((response.status == 401) || response.error) {
                this.accessToken = null;
                this.check();
            } else if (response.status == 200) {
                const player = await response.json();

                if (player.item) {
                    const image = player.item.album.images[0].url;
                    const title = player.item.name.replace(/(\(ft.*\))|(\(feat.*\))/gi, ""); // Remove (feat. ...)
                    let artists = [];

                    player.item.artists.forEach((artist) => {
                        artists.push(artist.name);
                    });

                    this.broadcast({
                        title: title,
                        artist: artists.join(", "),
                        image: image
                    });
                }
            }
        }
    }

    broadcast(event) {
        if (this.event) {
            // Don't re-notify
            if (this.event.title == event.title) {
                return;
            }
        }

        this.event = event;

        if (this.settings.announce) {
            koi.sendMessage(`Now playing: ${event.title} - ${event.artist}`, CAFFEINATED.userdata, "PUPPET");
        }

        MODULES.emitIO(this, "event", this.event);
    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        login: {
            display: "spotify.integration.login",
            type: "button",
            isLang: true
        },
        announce: {
            display: "spotify.integration.announce",
            type: "checkbox",
            isLang: true
        },
        enable_song_command: {
            display: "spotify.integration.enable_song_command",
            type: "checkbox",
            isLang: true
        },
        background_style: {
            display: "spotify.integration.background_style",
            type: "select",
            isLang: true
        },
        image_style: {
            display: "spotify.integration.image_style",
            type: "select",
            isLang: true
        }
    };

    defaultSettings = {
        login: () => {
            if (this.refreshToken) {
                this.refreshToken = null;
                this.accessToken = null;
                this.statusElement.innerText = LANG.getTranslation("spotify.integration.login");
            } else {
                const auth = new AuthCallback("caffeinated_spotify");

                // 15min timeout
                auth.awaitAuthMessage((15 * 1000) * 60).then((token) => {
                    this.setToken(token);
                }).catch((reason) => { /* Ignored. */ });

                openLink("https://accounts.spotify.com/en/authorize?client_id=dff9da1136b0453983ff40e3e5e20397&response_type=code&scope=user-read-playback-state&redirect_uri=https:%2F%2Fcasterlabs.co%2Fauth%3Ftype%3Dcaffeinated_spotify&state=" + auth.getStateString());
            }
        },
        announce: false,
        enable_song_command: false,
        background_style: ["Blur", "Clear", "Solid"],
        image_style: ["Left", "Right", "None"]
    };

};
