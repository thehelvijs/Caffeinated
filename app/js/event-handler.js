
function EventHandler() {
    let listeners = {};
    let callbackIdCounter = 0;

    return {
        on(type, callback) {
            const callbackId = callbackIdCounter++;

            type = type.toLowerCase();

            let callbacks = listeners[type] ?? {};

            callbacks[callbackId] = callback;

            listeners[type] = callbacks;

            return callbackId;
        },

        removeListener(type, callbackId) {
            delete listeners[type][callbackId];
        },

        broadcast(type, data) {
            const callbacks = listeners[type.toLowerCase()];

            if (callbacks) {
                Object.values(callbacks).forEach((callback) => {
                    try {
                        callback(Object.assign({}, data));
                    } catch (e) {
                        console.error("A listener produced an exception: ");
                        console.error(e);
                    }
                });
            }
        }
    };
}

function SingleEventHandler() {
    let listeners = {};
    let callbackIdCounter = 0;

    return {
        addListener(callback) {
            const callbackId = callbackIdCounter++;

            listeners[callbackId] = callback;

            return callbackId;
        },

        removeListener(callbackId) {
            delete listeners[callbackId];
        },

        broadcast(data) {
            Object.values(listeners).forEach((callback) => {
                try {
                    callback(Object.assign({}, data));
                } catch (e) {
                    console.error("A listener produced an exception: ");
                    console.error(e);
                }
            });
        }
    };
}
