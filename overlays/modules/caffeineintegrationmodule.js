
const CaffeineLoginResponse = {
    SUCCESSFUL: 0,
    UNSUCCESSFUL: 1,
    MFA_AWAIT: 2
}

const CAFFEINE = {
    refreshToken: "",
    credential: {},
    signed: "",
    connected: false,
    loggedIn: false,
    viewers: [],
    knownViewers: [],
    listeners: {},

    addEventListener(type, callback) {
        type = type.toLowerCase();

        let callbacks = this.listeners[type];

        if (!callbacks) callbacks = [];

        callbacks.push(callback);

        this.listeners[type] = callbacks;
    },

    broadcast(type, data) {
        let listeners = this.listeners[type.toLowerCase()];

        if (listeners) {
            listeners.forEach((callback) => {
                try {
                    callback(data);
                } catch (e) {
                    console.error("An event listener produced an exception: ");
                    console.error(e);
                }
            });
        }
    },

    /*login(username, password, mfa) {
        const instance = this;
    
        return new Promise((resolve) => {
            if (instance.refreshToken) {
                instance.refresh();
            } else {
                instance.loggedIn = false;
    
                let loginPayload = {
                    "account": {
                        "username": username,
                        "password": password
                    },
                    "mfa": {
                        "otp": mfa
                    }
                }
    
                CaffeineViewerUtil.httpPost("https://api.caffeine.tv/v1/account/signin", loginPayload).then((text) => {
                    let response = JSON.parse(text);
    
                    if (response.hasOwnProperty("next")) {
                        resolve(CaffeineLoginResponse.MFA_AWAIT);
                    } else if (response.hasOwnProperty("errors")) {
                        resolve(CaffeineLoginResponse.UNSUCCESSFUL);
                    } else {
                        instance.refreshToken = response.refresh_token;
                        instance.refresh();
                        resolve(CaffeineLoginResponse.SUCCESSFUL);
                    }
                });
            }
        });
    },*/

    refresh(refreshToken = this.refreshToken, reconnect) {
        if (this.connected) {
            this.ws.close();
            this.connected = false;
        }

        if (refreshToken) {
            const instance = this;
            let refreshPayload = {
                "refresh_token": refreshToken
            };

            CaffeineViewerUtil.httpPost("https://api.caffeine.tv/v1/account/token", refreshPayload).then((response) => {
                instance.credential = JSON.parse(response);

                if (!instance.credential.hasOwnProperty("errors")) {
                    CaffeineViewerUtil.httpGet("https://api.caffeine.tv/v1/users/" + instance.credential.caid + "/signed", instance.credential.access_token).then((signed) => {
                        instance.signed = signed.token;
                        instance.refreshToken = refreshToken;
                        instance.loggedIn = true;

                        if (reconnect) {
                            this.connectViewers();
                        }

                        setTimeout(() => {
                            instance.refresh(refreshToken);
                        }, (5 * 60) * 1000);
                    });
                }
            });
        }
    },

    connectViewers() {
        if (this.connected) {
            this.ws.close();
            this.connected = false;
        }

        const instance = this;
        this.connected = true;

        CaffeineViewerUtil.getUser(instance.credential.caid).then((watching) => {
            if (watching.caid == instance.credential.caid) {
                let payload = {
                    "Headers": {
                        "Authorization": "Bearer " + instance.credential.credentials.access_token,
                        "X-Client-Type": "external"
                    },
                    "Body": "{\"user\":\"" + instance.signed + "\"}"
                };
                instance.ws = new WebSocket("wss://realtime.caffeine.tv/v2/reaper/stages/" + instance.credential.caid.substring(4) + "/viewers");

                instance.ws.onopen = function () {
                    instance.ws.send(JSON.stringify(payload));
                    setInterval(() => {
                        instance.ws.send('"HEALZ"');
                    }, 20000);
                }

                instance.ws.onmessage = (message) => {
                    let message_raw = message.data;

                    if (message_raw != ("\"THANKS\"")) {
                        let json = JSON.parse(message_raw);

                        if (json.hasOwnProperty("total_user_count")) {
                            instance.broadcast("viewcount", json.total_user_count - 1); // Sub 1 for Koi
                        } else if (json.hasOwnProperty("user_event")) {
                            let status = json.user_event.is_viewing;
                            let viewing = instance.viewers.includes(json.user_event.caid);

                            if (status && !viewing) {
                                instance.addViewer(json.user_event.caid);
                            } else if (!status && viewing) {
                                instance.removeViewer(json.user_event.caid);
                            }
                        }
                    }
                }
            }
        });
    },

    addViewer(caid, chatUtil) {
        if (!this.viewers.includes(caid)) {
            this.viewers.push(caid);

            if (!this.knownViewers.includes(caid)) {
                this.knownViewers.push(caid);

                CaffeineViewerUtil.getUser(caid).then((user) => {
                    CAFFEINE.broadcast("join", {
                        user: user.username,
                        image: "https://images.caffeine.tv" + user.avatar_image_path,
                        color: "#FFFFFF"
                    });
                });
            }
        }
    },

    removeViewer(caid) {
        let index = this.viewers.indexOf(caid);

        if (index > -1) {
            this.viewers.splice(index, 1);

            setTimeout(() => {
                if (!this.viewers.includes(caid)) {
                    CaffeineViewerUtil.getUser(caid).then((user) => {
                        this.knownViewers.splice(this.knownViewers.indexOf(caid), 1);
                        CAFFEINE.broadcast("leave", {
                            user: user.username,
                            image: "https://images.caffeine.tv" + user.avatar_image_path,
                            color: "#FFFFFF"
                        });
                    });
                }
            }, 3000); // Prevent users from constantly popping.
        }
    },

}

const CaffeineViewerUtil = {
    getUser(id) {
        return new Promise((resolve) => {
            this.httpGet("https://api.caffeine.tv/v1/users/" + id).then((userdata) => { // We use Casterlabs' proxy here because there's no ratelimit
                resolve(userdata.user);
            });
        });
    },

    httpGet(url, credential) {
        return new Promise((resolve) => {
            let headers = {};

            if (credential) {
                headers.authorization = "Bearer " + credential;
            }

            const options = {
                method: "GET",
                headers: new Headers(headers),
            };

            fetch(url, options).then((response) => {
                response.text().then((text) => {
                    resolve(JSON.parse(text));
                });
            });
        });
    },

    httpPost(url, body, credential) {
        return new Promise((resolve) => {
            let headers = {
                "Content-Type": "application/json"
            };

            if (credential) {
                headers.authorization = "Bearer " + credential;
            }

            const options = {
                method: "POST",
                body: JSON.stringify(body),
                headers: new Headers(headers),
            };

            fetch(url, options).then((response) => {
                response.text().then((text) => {
                    resolve(text);
                });
            });
        });
    }
};

MODULES.moduleClasses["casterlabs_caffeine_integration"] = class {

    constructor(id) {
        this.namespace = "casterlabs_caffeine_integration";
        this.type = "settings";
        this.id = id;
    }

    init() {
        this.onSettingsUpdate(); // Try and connect.
    }

    getDataToStore() {
        return this.settings;
    }

    onSettingsUpdate() {
        this.settings.refresh_token = this.settings.refresh_token.split('"').join("");

        CAFFEINE.refresh(this.settings.refresh_token, true);
    }

    settingsDisplay = {
        refresh_token: "password"
    };

    defaultSettings = {
        refresh_token: ""
    };

};
