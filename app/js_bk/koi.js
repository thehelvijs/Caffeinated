class Koi {
    constructor(address) {
        var instance = this;
        this.ws = new WebSocket(address);

        this.ws.onopen = function () {
            instance.onopen();
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
                instance.onerror(json);
            } else if (json["type"] == "EVENT") {
                var event = json["event"];

                switch (event["event_type"]) {
                    case "CHAT": instance.onchat(event); break;
                    case "SHARE": instance.onshare(event); break;
                    case "FOLLOW": instance.onfollow(event); break;
                    case "DONATION": instance.ondonation(event); break;
                    case "INFO": instance.oninfo(event["event"]); break;
                    case "STREAM_STATUS": instance.onstatus(event); break;
                    case "USER_UPDATE": instance.onupdate(event); break;
                }
            } else {
                instance.onmessage(json);
            }
        };
    }

    onopen() {
        console.log("Open!");
    }

    isAlive() {
        return this.ws.readyState == this.ws.OPEN;
    }

    onmessage(json) {
        console.log(json);
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

    onchat(event) {
        console.log(event);
    }

    ondonation(event) {
        console.log(event);
    }

    onfollow(event) {
        console.log(event);
    }

    onshare(event) {
        console.log(event);
    }

    onstatus(event) {
        console.log(event);
    }

    onupdate(event) {
        console.log(event);
    }

    oninfo(event) {
        console.log(event);
    }

    close() {
        this.ws.close();
    }

    onerror(event) {
        console.log(event);
    }

}
