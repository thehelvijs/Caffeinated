
const CaffeineLoginResponse = {
    SUCCESSFUL: 0,
    UNSUCCESSFUL: 1,
    MFA_AWAIT: 2
}

class CaffeineViewers {

    constructor(chatUtil) {
        this.chatUtil = chatUtil;

        this.refreshToken = "";
        this.credential = {};
        this.signed = "";
        this.connected = false;
        this.loggedIn = false;
        this.viewers = [];
        this.knownViewers = [];
    }

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
    }*/

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
    }

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
                            // onViewerCount(json.total_user_count - 1); // Sub 1 for Koi
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
    }

    addViewer(caid) {
        if (!this.viewers.includes(caid)) {
            this.viewers.push(caid);

            if (!this.knownViewers.includes(caid)) {
                this.knownViewers.push(caid);

                CaffeineViewerUtil.getUser(caid).then((user) => {
                    this.chatUtil.addStatus(user.username, "https://images.caffeine.tv" + user.avatar_image_path, "#FFFFFF", "join");
                });
            }
        }
    }

    removeViewer(caid) {
        let index = this.viewers.indexOf(caid);

        if (index > -1) {
            this.viewers.splice(index, 1);

            setTimeout(() => {
                if (!this.viewers.includes(caid)) {
                    CaffeineViewerUtil.getUser(caid).then((user) => {
                        this.knownViewers.splice(this.knownViewers.indexOf(caid), 1);
                        this.chatUtil.addStatus(user.username, "https://images.caffeine.tv" + user.avatar_image_path, "#FFFFFF", "leave");
                    });
                }
            }, 3000); // Prevent users from constantly popping.
        }
    }

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

MODULES.moduleClasses["casterlabs_chat_display"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat_display";
        this.type = "application settings";
        this.id = id;
        this.icon = "chatbox";
        this.displayname = "Chat";

        const instance = this;

        koi.addEventListener("chat", (event) => {
            instance.util.addMessage(event.sender.username, event.sender.image_link, event.sender.color, event.message, event.id);
        });

        koi.addEventListener("share", (event) => {
            instance.util.addMessage(event.sender.username, event.sender.image_link, event.sender.color, event.message, event.id);
        });

        koi.addEventListener("donation", (event) => {
            instance.util.addMessage(event.sender.username, event.sender.image_link, event.sender.color, event.message, event.id, event.image);
        });

        koi.addEventListener("follow", (event) => {
            instance.util.addStatus(event.follower.username, event.follower.image_link, event.follower.color, "follow");
        });

    }

    init() {
        this.page.innerHTML = `
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap" rel="stylesheet" />
        <style>
            #vcclear {
                position: absolute;
                right: 15px;
                top: 0px;
            }

            .verticalchatmodule span {
                font-family: "Inter", sans-serif;
                color: white;
            }
        
            .vctext::before {
                content: "\\00a0";
            }
        
            .vctext {
                border-radius: 1px;
            }
        
            .vctext::after {
                content: "\\00a0";
            }
        
            .vcusername::after {
                content: "\\00a0";
            }
        
            .vcstatus {
                position: relative;
                font-style: italic;
                display: flex;
                align-items: center;
            }

            .vcstatus .vctext {
                color: #D0D0D0;
            }

            .vcchatmessage {
                position: relative;
                display: flex;
                align-items: center;
            }
        
            .vcimage {
                border-radius: 50%;
                object-fit: cover;
                max-height: 22px;
                max-width: 22px;
                padding-right: 5px;
                vertical-align: bottom;
                padding-bottom: 2px;
            }
        </style>
        <script src="https://unpkg.com/ionicons@5.1.2/dist/ionicons.js"></script>
        <div class="container verticalchatmodule">
            <div id="chatbox"></div>
            <button class="button" id="vcclear">
                Clear
            </button>
        </div>
        `.split("%id").join(this.id);

        this.util = new VerticalChatUtil(this);
        this.caffeine = new CaffeineViewers(this.util);

        this.onSettingsUpdate(); // Try and connect.

        window.test = this;
    }

    getDataToStore() {
        return this.settings;
    }

    onSettingsUpdate() {
        this.caffeine.refresh(this.settings.refresh_token, true);
    }

    settingsDisplay = {
        refresh_token: "password"
    };

    defaultSettings = {
        refresh_token: ""
    };

};

class VerticalChatUtil {

    constructor(module) {
        this.module = module;

        this.module.page.querySelector("#vcclear").addEventListener("click", () => {
            module.page.querySelector("#chatbox").innerHTML = "";
        });
    }

    addMessage(sender, profilePic, color, message, id, imageLink) {
        let div = document.createElement("div");
        let username = document.createElement("span");
        let pfp = document.createElement("img");
        let text = document.createElement("span");

        pfp.src = profilePic;
        pfp.classList.add("vcimage");

        username.classList.add("vcusername");
        username.style = "color: " + color + ";";
        username.appendChild(pfp);
        username.appendChild(document.createTextNode(sender));
        username.appendChild(text);

        text.classList.add("vctext");
        text.innerText = message;

        div.classList.add("vcchatmessage");
        div.setAttribute("vc_message_id", id);
        div.appendChild(username);

        if (imageLink) {
            let image = document.createElement("img");

            image.classList.add("vcimage");
            image.src = imageLink;

            username.appendChild(image);
        }

        this.module.page.querySelector("#chatbox").appendChild(div);

        this.jumpbottom();
    }

    addStatus(user, profilePic, color, type) {
        let div = document.createElement("div");
        let pfp = document.createElement("img");
        let username = document.createElement("span");
        let text = document.createElement("span");

        pfp.src = profilePic;
        pfp.classList.add("vcimage");

        username.classList.add("vcusername");
        username.style = "color: " + color + ";";
        username.innerText = user;

        switch (type.toLowerCase()) {
            case "leave": text.innerText = "left the stream."; break;
            case "join": text.innerText = "joined the stream."; break;
            case "follow": text.innerText = "started following."; break;
        }

        div.classList.add("vcchatmessage");
        div.classList.add("vcstatus");
        div.appendChild(pfp);
        div.appendChild(username);
        div.appendChild(text);

        this.module.page.querySelector("#chatbox").appendChild(div);

        this.jumpbottom();
    }

    isHidden() {
        return this.module.page.classList.contains("hide");
    }

    isAtBottom() {
        return (this.module.page.parentNode.scrollHeight - this.module.page.parentNode.scrollTop) < 500;
    }

    jumpbottom() {
        if (!this.isHidden() && this.isAtBottom()) {
            this.module.page.parentNode.scrollTo(0, this.module.page.querySelector("#chatbox").scrollHeight + 1000);
        }
    }

};
