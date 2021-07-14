
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
        const unsafeInvokable = new Invokable(invokableHandler, `${frameId}_unsafe`);
        const koiInvokable = new Invokable(invokableHandler, `${frameId}_koi`);
        const moduleInvokable = new Invokable(invokableHandler, `${frameId}_module`);
        const caffeinatedWindowInvokable = new Invokable(invokableHandler, `${frameId}_caffeinatedWindow`);
        const caffeinatedInvokable = new Invokable(invokableHandler, `${frameId}_caffeinated`);

        window.addEventListener("message", async (event) => {
            if (
                await unsafeInvokable.trigger(event.data) ||
                await moduleInvokable.trigger(event.data) ||
                await caffeinatedWindowInvokable.trigger(event.data) ||
                await caffeinatedInvokable.trigger(event.data) ||
                await koiInvokable.trigger(event.data)
            ) {
                console.debug(`[Module Sandbox, (${invokable.id}) -> Outside]`, event.data)
            }
        });

        // Unsafe
        {
            const UnsafeProxy = {
                ...invokable.funcs("loadDocumentContent", "eval"),

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
                }
            };

            unsafeInvokable.target = UnsafeProxy;
        }

        // Module
        {
            // Proxy events to the module.
            moduleHolder.module.on("*", moduleInvokable.func("emit"));

            moduleInvokable.target = moduleHolder.module;
        }

        // CaffeinatedWindow
        {
            const CaffeinatedWindowProxy = {

            };

            caffeinatedWindowInvokable.target = CaffeinatedWindowProxy;
        }

        // Koi
        const KoiProxy = {
            ...invokable.funcs("broadcast"),

            sendChat: koi.sendChat,
            getMaxLength: koi.getMaxLength,
            isAlive: koi.isAlive,
            upvote: koi.upvote,
            deleteMessage: koi.deleteMessage,
            test: koi.test
        };

        function sendKoiEvent(event) {
            if (event) {
                KoiProxy.broadcast(event.event_type, event);
            }
        }

        const koiListenerId = koi.addEventListener("event", sendKoiEvent);

        koiInvokable.target = KoiProxy;


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
