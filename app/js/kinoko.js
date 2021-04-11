
class Kinoko {

    constructor(baseUri = "wss://api.casterlabs.co/v1/kinoko") {
        this.listeners = {};
        this.baseUri = baseUri;
    }

    on(type, callback) {
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
                    callback(data);
                } catch (e) {
                    console.error("An event listener produced an exception: ");
                    console.error(e);
                }
            });
        }
    }

    disconnect() {
        if (this.ws && (this.ws.readyState == WebSocket.OPEN)) {
            this.ws.close();
        }
    }

    send(message, isJson = true) {
        if (this.ws && (this.ws.readyState == WebSocket.OPEN)) {
            if (this.proxy) {
                this.ws.send(message);
            } else {
                if (isJson) {
                    this.ws.send(JSON.stringify(message));
                } else {
                    this.ws.send(message);
                }
            }
        }
    }

    connect(channel, type = "client", proxy = false) {
        setTimeout(() => {
            const uri = this.baseUri + "?channel=" + encodeURIComponent(channel) + "&type=" + encodeURIComponent(type) + "&proxy=" + encodeURIComponent(proxy);

            this.disconnect();

            this.ws = new WebSocket(uri);
            this.proxy = proxy;

            this.ws.onerror = () => {
                this.connect(channel, type, proxy);
            }

            this.ws.onopen = () => {
                this.broadcast("open");
            };

            this.ws.onclose = () => {
                this.broadcast("close");
            };

            this.ws.onmessage = (message) => {
                const data = message.data;

                switch (data) {
                    case ":ping": {
                        if (!this.proxy) {
                            this.ws.send(":ping");
                            return;
                        }
                    }

                    case ":orphaned": {
                        this.broadcast("orphaned");
                        return;
                    }

                    case ":adopted": {
                        this.broadcast("adopted");
                        return;
                    }

                    default: {
                        if (this.proxy) {
                            this.broadcast("message", data);
                        } else {
                            try {
                                this.broadcast("message", JSON.parse(data));
                            } catch (ignored) {
                                this.broadcast("message", data);
                            }
                        }
                        return
                    }
                }
            };
        }, 1500);
    }

}

// Basically https://stackoverflow.com/a/8809472
function generateUUID() {
    let micro = (performance && performance.now && (performance.now() * 1000)) || 0;
    let millis = new Date().getTime();

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        let random = Math.random() * 16;

        if (millis > 0) {
            random = (millis + random) % 16 | 0;
            millis = Math.floor(millis / 16);
        } else {
            random = (micro + random) % 16 | 0;
            micro = Math.floor(micro / 16);
        }

        return ((c === "x") ? random : ((random & 0x3) | 0x8)).toString(16);
    });
}

function generateUnsafePassword(len = 32) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    return Array(len)
        .fill(chars)
        .map((x) => {
            return x[Math.floor(Math.random() * x.length)]
        }).join("");
}

function generateUnsafeUniquePassword(len = 32) {
    return generateUUID().replace(/-/g, "") + generateUnsafePassword(len);
}

class AuthCallback {

    constructor(type = "unknown") {
        this.id = `auth_redirect:${generateUnsafePassword(128)}:${type}`;
    }

    disconnect() {
        if (this.kinoko) {
            this.kinoko.disconnect();
        }

        this.kinoko = new Kinoko();
    }

    awaitAuthMessage(timeout = -1) {
        return new Promise((resolve, reject) => {
            this.disconnect();

            let fufilled = false;
            const id = (timeout > 0) ? setTimeout(() => {
                if (!fufilled) {
                    fufilled = true;
                    this.disconnect();
                    reject("TOKEN_TIMEOUT");
                }
            }, timeout) : -1;

            this.kinoko.connect(this.id, "parent");

            this.kinoko.on("close", () => {
                if (!fufilled) {
                    reject("CONNECTION_CLOSED");
                }

                clearTimeout(id);
            });

            this.kinoko.on("message", (message) => {
                fufilled = true;

                this.disconnect();

                if (message === "NONE") {
                    reject("NO_TOKEN_PROVIDED");
                } else if (message.startsWith("token:")) {
                    const token = message.substring(6);

                    resolve(token);
                } else {
                    reject("TOKEN_MESSAGE_INVALID");
                }
            });
        });
    }

    getStateString() {
        return this.id;
    }

}
