class Koi {
    constructor(address) {
        this.address = address;
        this.listeners = {};
        this.reconnect();
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

        let instance = this;
        this.ws = new WebSocket(this.address);

        this.ws.onopen = function () {
            instance.broadcast("open");
        };

        this.ws.onclose = function () {
            instance.broadcast("close");
        };

        this.ws.onmessage = function (message) {
            var raw = message.data;
            var json = JSON.parse(raw);

            if (json["type"] == "KEEP_ALIVE") {
                var json = {
                    request: "KEEP_ALIVE"
                };

                this.send(JSON.stringify(json));
            } else if (json["type"] == "ERROR") {
                instance.broadcast("error", json);
            } else if (json["type"] == "EVENT") {
                var event = json["event"];

                switch (event["event_type"]) {
                    case "CHAT": instance.broadcast("chat", event); break;
                    case "SHARE": instance.broadcast("share", event); break;
                    case "FOLLOW": instance.broadcast("follow", event); break;
                    case "DONATION": instance.broadcast("donation", event); break;
                    case "INFO": instance.broadcast("info", event["event"]); break;
                    case "STREAM_STATUS": instance.broadcast("streamstatus", event); break;
                    case "USER_UPDATE": instance.broadcast("userupdate", event); break;
                }
            } else {
                instance.broadcast("message", json);
            }
        };
    }

    isAlive() {
        return this.ws.readyState == this.ws.OPEN;
    }

    addUser(user) {
        var json = {
            request: "ADD",
            user: user
        };

        this.ws.send(JSON.stringify(json));
    }

    test(user, event) {
        var json = {
            request: "TEST",
            test: event,
            user: user
        };

        this.ws.send(JSON.stringify(json));
    }

    removeUser(user) {
        var json = {
            request: "REMOVE",
            user: user
        };

        this.ws.send(JSON.stringify(json));
    }

    close() {
        this.ws.close();
    }

}
