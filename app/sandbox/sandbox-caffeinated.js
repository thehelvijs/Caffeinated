
async function CaffeinatedProxy(invokableHandler, frameId) {
    const invokable = new Invokable(invokableHandler, `${frameId}_caffeinated`);

    const Caffeinated = {

        getTimeStreamedInMilliseconds() {
            const streamData = Koi.streamData;

            if (streamData && streamData.is_live) {
                return Date.now() - new Date(streamData.start_time).getTime();
            } else {
                return 0;
            }
        }

    };

    invokable.target = Caffeinated;

    Object.freeze(Caffeinated);
    Object.defineProperty(window, "Caffeinated", {
        value: Caffeinated,
        writable: false,
        configurable: false
    });

    return invokable;
};
