class Invokable {

    constructor(transmissionHandler, id) {
        this.transmissionHandler = transmissionHandler;
        this.target = null;
        this.id = id;
        this.callbacks = {};

        const instance = this;

        function createLoosePromise() {
            let resolve;
            let reject;
            let state = "pending";

            let promise = new Promise((_resolve, _reject) => {
                resolve = (value) => {
                    state = "fulfilled";
                    _resolve(value);
                };
                reject = (error) => {
                    state = "rejected";
                    _reject(error);
                };
            });

            Object.defineProperty(promise, "resolve", {
                get: () => {
                    return resolve;
                }
            });

            Object.defineProperty(promise, "reject", {
                get: () => {
                    return reject;
                }
            });

            Object.defineProperty(promise, "state", {
                get: () => {
                    return state;
                }
            });

            return promise;
        }

        this.func = function (name, ...args) {
            // Invokable Proxy.
            const nonce = (Math.random() * 100000).toFixed(0);

            instance.transmissionHandler({
                __meta: `invokable_js_${this.id}`,
                type: "func",
                field: name,
                args: args,
                nonce: nonce
            });

            const promise = createLoosePromise();

            instance.callbacks[nonce] = promise;

            return promise;
        }
    }

    async trigger(data) {
        if (this.target && (data.__meta == `invokable_js_${this.id}`)) {
            try {
                if (data.type == "result") {
                    const callback = this.callbacks[data.nonce];

                    if (data.state == "fulfilled") {
                        callback.resolve(data.result);
                    } else {
                        callback.reject(data.result);
                    }
                } else if (data.type == "data") {
                    this.target[data.field] = data.value;
                } else if (data.type == "func") {
                    let result;
                    let state;

                    try {
                        result = await this.target[data.field](...data.args);
                        state = "fulfilled";
                    } catch (e) {
                        result = e;
                        state = "rejected";
                    } finally {
                        this.transmissionHandler({
                            __meta: `invokable_js_${this.id}`,
                            type: "result",
                            result: result,
                            state: state,
                            nonce: data.nonce
                        });
                    }
                }
            } catch (e) {
                console.error(e);
            }

            return true;
        }

        return false;
    }

    transmit(name, ...data) {
        this.transmissionHandler({
            __meta: `invokable_js_${this.id}`,
            type: "data",
            field: name,
            value: data
        });
    }

    callFunc(name, ...args) {
        this.transmissionHandler({
            __meta: `invokable_js_${this.id}`,
            type: "func",
            field: name,
            args: args
        });
    }

    funcs(...names) {
        const instance = this;
        let result = {};

        for (const name of names) {
            result[name] = function () {
                instance.func(name, ...arguments)
            };
        }

        return result;
    }

}
