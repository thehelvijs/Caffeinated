
async function ModuleProxy(invokableHandler, frameId, currentType) {
    const invokable = new Invokable(invokableHandler, `${frameId}_module`);

    let moduleInfo = await invokable.func("getInfo")();
    let settings = await invokable.func("getSettings")();
    let settingsDisplay = {};

    const moduleEventHandler = new EventHandler();

    let hasRenderedInitialSettingsDisplay = false;

    const setSettingsDisplay = invokable.func("setSettingsDisplay");
    const setSettings = invokable.func("setSettings");

    const Module = {
        ...moduleEventHandler,

        // Info
        get id() {
            return moduleInfo.id;
        },

        get namespace() {
            return moduleInfo.namespace;
        },

        get types() {
            return moduleInfo.types;
        },

        get currentType() {
            return currentType;
        },

        // Settings
        get settings() {
            return settings;
        },

        set settings(value) {
            settings = value;
            setSettings(value);
        },

        // Settings Display
        get settingsDisplay() {
            return settingsDisplay;
        },

        set settingsDisplay(value) {
            settingsDisplay = value;

            setSettingsDisplay(value)
                .then(() => {
                    // Render the first time the settingsDisplay is set.
                    // Subsequent times will require a call to #renderSettingsDisplay().
                    if (!hasRenderedInitialSettingsDisplay) {
                        hasRenderedInitialSettingsDisplay = true;
                        this.renderSettingsDisplay();
                    }
                });
        },

        ...invokable.funcs("renderSettingsDisplay")
    };

    invokable.target = Module;

    Object.freeze(Module);
    Object.defineProperty(window, "Module", {
        value: Module,
        writable: false,
        configurable: false
    });

    return invokable;
};
