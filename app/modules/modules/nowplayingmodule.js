
MODULES.moduleClasses["casterlabs_now_playing"] = class {

    constructor(id) {
        this.namespace = "casterlabs_now_playing";
        this.type = "overlay settings";
        this.id = id;

        this.uuid = generateUUID();
        this.kinoko = new Kinoko();

        this.kinoko.on("message", async (data) => {
            if (data.startsWith("token:")) {
                const code = data.split(":")[1];
                const authResult = await (await fetch("https://api.casterlabs.co/proxy/spotify/token?code=" + code)).json();

                if (!authResult.error) {
                    this.statusElement.innerText = "Logging in";

                    this.refreshToken = authResult.refresh_token;

                    MODULES.saveToStore(this);
                } else {
                    this.settings.token = null;
                    this.statusElement.innerText = "Login with Spotify";
                }
            }
        });

        this.kinoko.connect("auth_redirect:" + this.uuid + ":spotify", "parent");
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

    getDataToStore() {
        return Object.assign({
            token: this.refreshToken
        }, this.settings);
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", {
            background: this.settings.background,
            image_style: this.settings.image_style
        }, socket);
    }

    init() {
        setInterval(() => this.check(), 1000);

        const element = document.querySelector("#casterlabs_now_playing_" + this.id).querySelector("[name=login]");

        element.style = "overflow: hidden; background-color: rgb(30, 215, 96); margin-top: 15px;";
        element.innerHTML = `
            <img src="https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png" style="height: 3.5em; position: absolute; left: -5px;" />
            <span style="padding-left: 1.75em; z-index: 2;" name="text">Login with Spotify</span>
        `;

        this.statusElement = element.querySelector("[name=text]");

        if (this.settings.token) {
            this.refreshToken = this.settings.token;
            this.check();
        }
    }

    async check() {
        if (this.refreshToken) {
            if (!this.accessToken) {
                const auth = await (await fetch("https://api.casterlabs.co/proxy/spotify/token?refresh_token=" + this.refreshToken)).json();

                if (auth.error) {
                    this.refreshToken = null;
                    this.statusElement.innerText = "Login with Spotify";
                } else {
                    this.statusElement.innerText = "Logging in";

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

                    this.statusElement.innerText = "Logged in as " + profile.display_name + " (Click to log out)";
                }

                MODULES.saveToStore(this);
            }

            const response = await fetch("https://api.spotify.com/v1/me/player", {
                headers: {
                    "content-type": "application/json",
                    authorization: "Bearer " + this.accessToken
                }
            });

            if (response.error) {
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

                    MODULES.emitIO(this, "event", {
                        title: title,
                        artist: artists.join(", "),
                        image: image
                    });
                }
            }
        }
    }

    onSettingsUpdate() {
        MODULES.emitIO(this, "config", this.settings);
    }

    settingsDisplay = {
        login: {
            display: "Login with Spotify",
            type: "button"
        },
        background: "select",
        image_style: "select"
    };

    defaultSettings = {
        login: () => {
            if (this.refreshToken) {
                this.refreshToken = null;
                this.accessToken = null;
                this.statusElement.innerText = "Login with Spotify";
            } else {
                const link = "https://accounts.spotify.com/en/authorize?client_id=dff9da1136b0453983ff40e3e5e20397&response_type=code&scope=user-read-playback-state&redirect_uri=https:%2F%2Fcasterlabs.co%2Fauth%3Ftype%3Dspotify&state=";

                openLink(link + this.uuid);
            }
        },
        background: ["Blur", "Clear", "Solid"],
        image_style: ["Left", "Right", "None"]
    };

};