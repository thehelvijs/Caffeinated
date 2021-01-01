class Koi {
    constructor(address) {
        this.address = address;
        this.listeners = {};
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
        if (this.ws && !this.ws.CLOSED) {
            this.ws.close();
        }

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
            } else if (json["type"] == "ERROR") {
                this.broadcast("error", json);
            } else if (json["type"] == "EVENT") {
                const event = json["event"];
                const type = event["event_type"];

                if (type === "INFO") {
                    this.broadcast("info", event["event"]);
                } else {
                    if ((event.id === "") && (type === "DONATION")) { // We detect test events by seeing if the message id is empty.
                        event.donations.forEach((donation) => {
                            donation.amount = 9;

                            // TODO keep this up-to-date with new platforms.
                            if (isPlatform("CAFFEINE")) {
                                donation.currency = "CAFFEINE_CREDITS";
                                donation.image = "https://assets.caffeine.tv/digital-items/praise.36c2c696ce186e3d57dc4ca69482f315.png";
                                donation.animated_image = "https://assets.caffeine.tv/digital-items/praise_preview.062e1659faa201a6c9fb0f4599bfa8ef.png";
                            }
                        });
                    }

                    this.broadcast(type.toLowerCase(), event);
                }
            } else {
                this.broadcast("message", json);
            }
        };
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
