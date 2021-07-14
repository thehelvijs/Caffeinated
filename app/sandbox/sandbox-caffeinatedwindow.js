
async function CaffeinatedWindowProxy(invokableHandler, frameId) {
    const invokable = new Invokable(invokableHandler, `${frameId}_caffeinatedWindow`);

    const CaffeinatedWindow = {
        ...invokable.funcs("reload", "openLink")
    };

    invokable.target = CaffeinatedWindow;

    Object.freeze(CaffeinatedWindow);
    Object.defineProperty(window, "CaffeinatedWindow", {
        value: CaffeinatedWindow,
        writable: false,
        configurable: false
    });

    return invokable;
};
