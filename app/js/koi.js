class Koi {
    constructor(address) {
        this.address = address;
        this.listeners = {};
        this.credentialCallbacks = [];
    }

    addEventListener(type, callback) {
        type = type.toLowerCase();

        let callbacks = this.listeners[type];

        if (!callbacks) callbacks = [];

        callbacks.push(callback);

        this.listeners[type] = callbacks;
    }

    broadcast(type, data) {
        const listeners = this.listeners[type.toLowerCase()];

        if (listeners) {
            listeners.forEach((callback) => {
                try {
                    callback(Object.assign({}, data));
                } catch (e) {
                    console.error("An event listener produced an exception: ");
                    console.error(e);
                }
            });
        }
    }

    reconnect() {
        if (this.ws && (this.ws.readyState != WebSocket.CLOSED)) {
            this.ws.close();
        } else {
            try {
                this.ws = new WebSocket(this.address);

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

                this.ws.onmessage = (payload) => {
                    const raw = payload.data;
                    const json = JSON.parse(raw);

                    if (json["type"] == "KEEP_ALIVE") {
                        this.ws.send(JSON.stringify({
                            type: "KEEP_ALIVE"
                        }));
                    } else if (json["type"] == "CREDENTIALS") {
                        this.credentialCallbacks.forEach((callback) => callback.resolve(json));
                        this.credentialCallbacks = [];
                    } else if (json["type"] == "ERROR") {
                        if (json.error === "AUTH_INVALID") {
                            this.credentialCallbacks.forEach((callback) => callback.reject());
                            this.credentialCallbacks = [];
                        }

                        this.broadcast("error", json);
                    } else if (json["type"] == "EVENT") {
                        const event = json["event"];
                        const type = event["event_type"];

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

                        this.broadcast(type.toLowerCase(), event);
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

    sendMessage(message) {
        if (this.isAlive()) {
            if (isPlatform("TWITCH")) {
                message = message.replace(/\n/gm, " ");
            }

            this.ws.send(JSON.stringify({
                type: "CHAT",
                message: message
            }));
        }
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
