
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
        const caffeinatedWindowInvokable = new Invokable(invokableHandler, `${frameId}_caffeinatedwindow`);
        const koiInvokable = new Invokable(invokableHandler, `${frameId}_koi`);
        const caffeinatedInvokable = new Invokable(invokableHandler, `${frameId}_caffeinated`);
        const moduleInvokable = new Invokable(invokableHandler, `${frameId}_module`);
        const unsafeInvokable = new Invokable(invokableHandler, `${frameId}_unsafe`);

        window.addEventListener("message", async (event) => {
            if (
                // Down the Invokable rabbit hole.
                (await caffeinatedWindowInvokable.trigger(event.data)) ||
                (await koiInvokable.trigger(event.data))
            ) {
                // console.debug(`[Module Sandbox, (${caffeinatedWindowInvokable.id}) -> Outside]`, event.data)
            }
        });

        // Caffeinated Window

        const CaffeinatedWindow = {
            reload: () => {
                reload();
            },
            openLink: (link) => {
                openLink(link);
            },
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

            ...caffeinatedWindowInvokable.funcs("loadDocumentContent", "eval")
        };

        caffeinatedWindowInvokable.target = CaffeinatedWindow;

        // Add helpers for exposing the frame to the outside.
        frame.CaffeinatedWindow = CaffeinatedWindow;

        frame.on = (type, callback) => {
            type = type.toLowerCase();

            let callbacks = moduleListeners[type];

            if (!callbacks) callbacks = [];

            callbacks.push(callback);

            moduleListeners[type] = callbacks;
        };

        frame.emit = (type, data) => {
            caffeinatedWindowInvokable.callFunc("broadcast", type, data);
        };

        // Koi
        const koiProxy = {
            ...koiInvokable.funcs("broadcast"),

            // Proxy to global koi
            sendChat: koi.sendChat,
            getMaxLength: koi.getMaxLength,
            isAlive: koi.isAlive,
            upvote: koi.upvote,
            deleteMessage: koi.deleteMessage,
            test: koi.test,
        };

        function sendKoiEvent(event) {
            if (event) {
                koiProxy.broadcast("event", event);
                koiProxy.broadcast(event.event_type, event);
            }
        }

        const koiListenerId = koi.addEventListener("event", sendKoiEvent);

        koiInvokable.target = koiProxy;

        // UNSAFE
        const unsafeProxy = {
            getSystemInfo() {
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

            getModuleInfo() {
                return {
                    id: moduleHolder.id,
                    namespace: moduleHolder.namespace,
                    types: moduleHolder.getTypes()
                };
            }
        };

        unsafeInvokable.target = unsafeProxy;

        // Init
        if (onLoadListener) {
            onLoadListener(frame);
        }

        let alreadyLoadedSrc = false;

        frame.on("document_content_load", async () => {
            if (src && !alreadyLoadedSrc) {
                alreadyLoadedSrc = true;

                const contents = await (await fetch(src)).text();

                CaffeinatedWindow.loadDocumentContent(contents);
            }

            sendKoiEvent(koi.viewerList);
            sendKoiEvent(koi.userData);
            sendKoiEvent(koi.streamData);
        });

        frame.unregister = () => {
            koi.removeListener("event", koiListenerId);
            frame.remove();
        };

        const consolePrefix = moduleHolder ? `` : "anonymous-sandboxed-window";

        // Load the sandbox helper.
        frame.src = `${__dirname}/sandbox.html?frameId=${frameId}&consolePrefix=${consolePrefix}`;
    };

    reload();

    return div;
}
