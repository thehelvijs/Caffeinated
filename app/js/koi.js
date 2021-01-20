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
                            event.isTest = true;

                            event.donations.forEach((donation) => {
                                // TODO keep this up-to-date with new platforms.
                                if (isPlatform("CAFFEINE")) {
                                    event.sender.platform = "CAFFEINE"; // Internally we detect Caffeine props and display the image via the platform

                                    donation.amount = 9;
                                    donation.currency = "CAFFEINE_CREDITS";
                                    donation.image = "https://assets.caffeine.tv/digital-items/praise.36c2c696ce186e3d57dc4ca69482f315.png";
                                    donation.animated_image = "https://assets.caffeine.tv/digital-items/praise_preview.062e1659faa201a6c9fb0f4599bfa8ef.png";
                                } else if (isPlatform("TWITCH")) {
                                    donation.amount = 100;
                                    donation.currency = "TWITCH_BITS";
                                    donation.image = "https://static-cdn.jtvnw.net/bits/dark/static/purple/4";
                                    donation.animated_image = "https://static-cdn.jtvnw.net/bits/dark/animated/purple/4";
                                }
                            });
                        } else if ((type === "FOLLOW") && (event.follower.platform === "CASTERLABS_SYSTEM")) {
                            event.isTest = true;
                        } else if ((type === "CHAT") && (event.sender.platform === "CASTERLABS_SYSTEM")) {
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
        this.ws.send(JSON.stringify({
            type: "UPVOTE",
            message_id: messageId
        }));
    }

    sendMessage(message) {
        if (isPlatform("TWITCH")) {
            message = message.replace(/\n/gm, " ");
        }

        this.ws.send(JSON.stringify({
            type: "CHAT",
            message: message
        }));
    }

    isAlive() {
        return this.ws.readyState == this.ws.OPEN;
    }

    test(event) {
        if (this.ws.readyState != WebSocket.OPEN) return;

        this.ws.send(JSON.stringify({
            type: "TEST",
            eventType: event.toUpperCase()
        }));
    }

    close() {
        this.ws.close();
    }

}
