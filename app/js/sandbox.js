
function createSandboxedIframe(src, onLoadListener, moduleHolder) {
    const div = document.createElement("div");

    let frame = null;

    let moduleListeners = {};

    div.style = `width: 100%; height: 100%;`;

    const reload = async () => {
        frame?.remove();
        frame = document.createElement("iframe");
        frame.style = `width: 100%; height: 100%;`;
        frame.sandbox = `allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-scripts`;

        div.appendChild(frame);

        const frameId = generateUUID();
        const invokableHandler = (data) => {
            frame.contentWindow.postMessage(data, "*");
        };

        // Proxy all calls through postMessage.
        const invokable = new Invokable(invokableHandler, frameId);

        window.addEventListener("message", async (event) => {
            if (await invokable.trigger(event.data)) {
                console.debug(`[Module Sandbox, (${invokable.id}) -> Outside]`, event.data)
            }
        });

        const PROXY = {
            // UNSAFE
            unsafe_getSystemInfo() {
                return {
                    implementation: "Casterlabs Caffeinated",
                    enviroment: "DESKTOP",
                    version: VERSION,
                    protocolVersion: PROTOCOLVERSION,
                    productChannel: CAFFEINATED.getChannel(),
                    serverDomain: CAFFEINATED.store.get("server_domain"),
                    languagePreference: CAFFEINATED.store.get("language")
                };
            },
            unsafe_getModuleInfo() {
                if (moduleHolder) {
                    return {
                        id: moduleHolder.id,
                        namespace: moduleHolder.namespace,
                        types: moduleHolder.getTypes()
                    };
                } else {
                    return {
                        id: null,
                        namespace: null,
                        types: null
                    };
                }
            },

            // CaffeinatedWindow
            reload: () => {
                reload();
            },
            openLink: (link) => {
                openLink(link);
            },

            // Koi
            ...invokable.funcs("koi_broadcast"),
            koi_sendChat: koi.sendChat,
            koi_getMaxLength: koi.getMaxLength,
            koi_isAlive: koi.isAlive,
            koi_upvote: koi.upvote,
            koi_deleteMessage: koi.deleteMessage,
            koi_test: koi.test,

            // Misc
            emit: (type, data) => {
                const listeners = moduleListeners[type.toLowerCase()];

                if (listeners) {
                    listeners.forEach((callback) => {
                        try {
                            callback(data);
                        } catch (e) {
                            console.error("A frame event listener produced an exception: ");
                            console.error(e);
                        }
                    });
                }
            },
            ...invokable.funcs("loadDocumentContent", "eval")
        };

        // Koi
        function sendKoiEvent(event) {
            if (event) {
                PROXY.koi_broadcast("event", event);
                PROXY.koi_broadcast(event.event_type, event);
            }
        }

        const koiListenerId = koi.addEventListener("event", sendKoiEvent);


        invokable.target = PROXY;


        // Init
        if (onLoadListener) {
            onLoadListener(frame);
        }

        frame.on = (type, callback) => {
            type = type.toLowerCase();

            let callbacks = moduleListeners[type];

            if (!callbacks) callbacks = [];

            callbacks.push(callback);

            moduleListeners[type] = callbacks;
        };

        // frame.emit = (type, data) => {
        //     invokable.callFunc("broadcast", type, data);
        // };

        let alreadyLoadedSrc = false;

        frame.on("document_content_load", async () => {
            if (src && !alreadyLoadedSrc) {
                alreadyLoadedSrc = true;

                const contents = await (await fetch(src)).text();

                PROXY.loadDocumentContent(contents);
            }

            sendKoiEvent(koi.viewerList);
            sendKoiEvent(koi.userData);
            sendKoiEvent(koi.streamData);
        });

        frame.destroy = () => {
            koi.removeListener("event", koiListenerId);
            frame.remove();
        };

        const consolePrefix = moduleHolder ? `sandboxed-window` : "anonymous-sandboxed-window";

        // Load the sandbox helper.
        frame.src = `${__dirname}/sandbox.html?frameId=${frameId}&consolePrefix=${consolePrefix}`;
    };

    reload();

    return div;
}
