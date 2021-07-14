
async function KoiProxy(invokableHandler, frameId) {
    const invokable = new Invokable(invokableHandler, `${frameId}_koi`);

    const koiEventHandler = new EventHandler();
    let warnedDeprecated_addEventListener = false;

    let viewerList = [];
    let userData = null;
    let streamData = null;

    const koi = {
        ...invokable.funcs("sendChat", "getMaxLength", "isAlive", "upvote", "deleteMessage", "test"),

        ...koiEventHandler,

        // Deprecated
        addEventListener: function () {
            if (!warnedDeprecated_addEventListener) {
                warnedDeprecated_addEventListener = true;
                console.warn("Calls to koi.addEventListener are deprecated. Tell the author of this plugin to use `koi.on` instead.");
            }

            return koiEventHandler.on(...arguments);
        },

        get viewerList() {
            return viewerList;
        },

        get userData() {
            return userData;
        },

        get streamData() {
            return streamData;
        }
    };

    invokable.target = koi;

    koi.on("user_update", (event) => {
        viewerList = event;
    });
    koi.on("user_update", (event) => {
        userData = event;
    });
    koi.on("stream_status", (event) => {
        streamData = event;
    });

    Object.freeze(koi);
    Object.defineProperty(window, "Koi", {
        value: koi,
        writable: false,
        configurable: false
    });

    return invokable;
};
