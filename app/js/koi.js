class Koi {

    constructor(address) {
        this.address = address;
        this.credentialCallbacks = [];

        this.eventHandler = new EventHandler();

        // Add the event handler
        this.addEventListener = this.eventHandler.on; // Deprecated
        this.on = this.eventHandler.on;
        this.removeListener = this.eventHandler.removeListener;
        this.broadcast = this.eventHandler.broadcast;

        // Add static properties
        let viewerList = null;
        let userData = null;
        let streamData = null;

        this.eventHandler.on("viewer_list", (event) => {
            viewerList = event
        });
        this.eventHandler.on("user_update", (event) => {
            userData = event
        });
        this.eventHandler.on("stream_status", (event) => {
            streamData = event
        });

        Object.defineProperty(this, "viewerList", {
            get: () => viewerList,
            configurable: false
        });
        Object.defineProperty(this, "userData", {
            get: () => userData,
            configurable: false
        });
        Object.defineProperty(this, "streamData", {
            get: () => streamData,
            configurable: false
        });
    }

    reconnect() {
        if (this.ws && (this.ws.readyState != WebSocket.CLOSED)) {
            this.ws.close();
        } else {
            try {
                this.ws = new WebSocket(this.address);

                let userAuthReached = false;

                this.ws.onerror = () => {
                    setTimeout(() => this.reconnect, 1000);
                }

                this.ws.onopen = () => {
                    this.broadcast("open");

                    if (CAFFEINATED.token) {
                        this.ws.send(JSON.stringify({
                            type: "LOGIN",
                            token: CAFFEINATED.token
                        }));
                    }
                };

                this.ws.onclose = () => {
                    this.broadcast("close");
                };

                this.ws.onmessage = async (payload) => {
                    const raw = payload.data;
                    const json = JSON.parse(raw);

                    if (json.type == "KEEP_ALIVE") {
                        this.ws.send(JSON.stringify({
                            type: "KEEP_ALIVE"
                        }));
                    } else if (json.type == "NOTICE") {
                        const notice = json.notice;

                        console.debug("New notice:");
                        console.debug(notice);

                        CAFFEINATED.triggerBanner(notice.id, (element) => {
                            element.innerHTML = notice.message;
                        }, notice.color);
                    } else if (json.type == "CREDENTIALS") {
                        this.credentialCallbacks.forEach((callback) => callback.resolve(json));
                        this.credentialCallbacks = [];
                    } else if (json.type == "ERROR") {
                        if (json.error === "AUTH_INVALID") {
                            this.credentialCallbacks.forEach((callback) => callback.reject());
                            this.credentialCallbacks = [];
                        }

                        this.broadcast("error", json);
                    } else if (json.type == "EVENT") {
                        const event = json.event;
                        const type = event.event_type;

                        if ((type === "DONATION") && (event.sender.platform === "CASTERLABS_SYSTEM")) {
                            const streamerPlatform = CAFFEINATED.userdata.streamer.platform; // TODO MOVE AWAY FROM THIS
                            event.isTest = true;

                            event.donations.forEach((donation) => {
                                // TODO keep this up-to-date with new platforms.
                                if (streamerPlatform === "CAFFEINE") {
                                    donation.amount = 9;
                                    donation.currency = "CAFFEINE_CREDITS";
                                    donation.image = "https://assets.caffeine.tv/digital-items/praise.36c2c696ce186e3d57dc4ca69482f315.png";
                                    donation.animated_image = "https://assets.caffeine.tv/digital-items/praise_preview.062e1659faa201a6c9fb0f4599bfa8ef.png";
                                    donation.type = "CAFFEINE_PROP";
                                } else if (streamerPlatform === "TWITCH") {
                                    donation.amount = 100;
                                    donation.currency = "TWITCH_BITS";
                                    donation.image = "https://d3aqoihi2n8ty8.cloudfront.net/actions/party/light/static/100/4.gif";
                                    donation.animated_image = "https://d3aqoihi2n8ty8.cloudfront.net/actions/party/light/animated/100/4.gif";
                                    donation.type = "TWITCH_BITS";
                                }
                            });

                            // Add an emote to the message since that's how they work on Twitch
                            if (streamerPlatform === "TWITCH") {
                                event.message = event.message + " Party100";

                                event.emotes["Party100"] = "https://d3aqoihi2n8ty8.cloudfront.net/actions/party/light/animated/100/4.gif";
                            }
                        } else if ((type === "FOLLOW") && (event.follower.platform === "CASTERLABS_SYSTEM")) {
                            event.isTest = true;
                        } else if ((type === "CHAT") && (event.sender.platform === "CASTERLABS_SYSTEM")) {
                            event.isTest = true;
                        } else if ((type === "SUBSCRIPTION") && event.subscriber && (event.subscriber.platform === "CASTERLABS_SYSTEM")) {
                            event.isTest = true;
                        }

                        if ((type === "USER_UPDATE") && !userAuthReached) {
                            // Make this only execute once.
                            userAuthReached = true;

                            if (CAFFEINATED.puppetToken) {
                                this.ws.send(JSON.stringify({
                                    type: "PUPPET_LOGIN",
                                    token: CAFFEINATED.puppetToken
                                }));
                            }
                        }

                        this.broadcast("event", event);
                        this.broadcast(type.toLowerCase(), event);

                        ANALYTICS.logEvent(event);
                    } else {
                        this.broadcast("message", json);
                    }
                };
            } catch (e) {
                this.reconnect();
            }
        }
    }

    getCredentials() {
        return new Promise((resolve, reject) => {
            this.credentialCallbacks.push({
                resolve: resolve,
                reject: reject
            });

            this.ws.send(JSON.stringify({
                type: "CREDENTIALS"
            }));
        });
    }

    upvote(messageId) {
        if (this.isAlive()) {
            this.ws.send(JSON.stringify({
                type: "UPVOTE",
                message_id: messageId
            }));
        }
    }

    deleteMessage(messageId) {
        if (this.isAlive()) {
            this.ws.send(JSON.stringify({
                type: "DELETE",
                message_id: messageId
            }));
        }
    }

    sendMessage(message, event = CAFFEINATED.userdata, chatter = "CLIENT") {
        if (message.startsWith("/caffeinated")) {
            this.broadcast("x_caffeinated_command", { text: message });
        } else {
            if (!CAFFEINATED.puppetToken) {
                chatter = "CLIENT";
            }

            if (this.isAlive() && event) {
                if (event.streamer.platform !== "CAFFEINE") {
                    message = message.replace(/\n/gm, " ");
                }

                this.ws.send(JSON.stringify({
                    type: "CHAT",
                    message: message.substring(0, this.getMaxLength(event)),
                    chatter: chatter
                }));
            }
        }
    }

    getMaxLength(event = CAFFEINATED.userdata) {
        if (event) {
            const platform = event.streamer.platform;

            switch (platform) {
                case "CAFFEINE":
                    return 80;

                case "TWITCH":
                    return 500;

                case "TROVO":
                    return 300;

                case "GLIMESH":
                    return 255;

                case "BRIME":
                    return 300;

                default:
                    console.debug(platform);
            }
        }

        return 100; // ?
    }

    isAlive() {
        return this.ws && (this.ws.readyState == WebSocket.OPEN);
    }

    test(event) {
        if (this.isAlive()) {
            this.ws.send(JSON.stringify({
                type: "TEST",
                eventType: event.toUpperCase()
            }));
        }
    }

    close() {
        this.ws.close();
    }

}
