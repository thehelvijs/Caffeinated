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
    }

    reconnect() {
        if (this.ws && !this.ws.CLOSED) {
            this.ws.close();
        }

        const instance = this;

        this.ws = new WebSocket(this.address);

        this.ws.onerror = function () {
            setTimeout(() => instance.reconnect, 1000);
        }

        this.ws.onopen = function () {
            instance.broadcast("open");
        };

        this.ws.onclose = function () {
            instance.broadcast("close");
        };

        this.ws.onmessage = function (message) {
            let raw = message.data;
            let json = JSON.parse(raw);

            if (json["type"] == "KEEP_ALIVE") {
                let json = {
                    request: "KEEP_ALIVE"
                };

                this.send(JSON.stringify(json));
            } else if (json["type"] == "ERROR") {
                instance.broadcast("error", json);
            } else if (json["type"] == "EVENT") {
                let event = json["event"];
                let type = event["event_type"];

                switch (type) {
                    case "INFO": instance.broadcast("info", event["event"]); return;

                    // We still let these broadcast with _'s aswell.
                    case "STREAM_STATUS": instance.broadcast("streamstatus", event); break;
                    case "USER_UPDATE": instance.broadcast("userupdate", event); break;
                    default: break;
                }

                instance.broadcast(type.toLowerCase(), event);
            } else {
                instance.broadcast("message", json);
            }
        };
    }

    isAlive() {
        return this.ws.readyState == this.ws.OPEN;
    }

    addUser(user) {
        if (this.ws.readyState != WebSocket.OPEN) return;

        let json = {
            request: "ADD",
            user: user
        };

        this.ws.send(JSON.stringify(json));
    }

    setCurrency(currency) {
        if (this.ws.readyState != WebSocket.OPEN) return;

        let json = {
            request: "PREFERENCES",
            preferences: {
                currency: currency
            }
        };

        this.ws.send(JSON.stringify(json));
    }

    test(user, event) {
        if (this.ws.readyState != WebSocket.OPEN) return;

        let json = {
            request: "TEST",
            test: event,
            user: user
        };

        this.ws.send(JSON.stringify(json));
    }

    removeUser(user) {
        if (this.ws.readyState != WebSocket.OPEN) return;

        let json = {
            request: "REMOVE",
            user: user
        };

        this.ws.send(JSON.stringify(json));
    }

    close() {
        this.ws.close();
    }

}
