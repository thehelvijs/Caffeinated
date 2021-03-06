
class ModuleHolder {
    #module;
    sockets = [];
    dockSockets = [];
    #elements;

    constructor(module, elements = []) {
        this.#module = module;
        this.#elements = elements;
    }

    getUUID() {
        return this.#module.namespace + ":" + this.#module.id;
    }

    unload() {
        if (this.#module.onUnload) {
            this.#module.onUnload();
        }

        this.#elements.forEach((element) => element.remove());

        this.sockets.forEach((socket) => socket.disconnect());
        this.dockSockets.forEach((socket) => socket.disconnect());

        // delete MODULES.moduleClasses[this.#module.namespace];
    }

    associateElement(element) {
        this.#elements.push(element);
    }

    getElements() {
        return this.#elements;
    }

    getInstance() {
        return this.#module;
    }

    getTypes() {
        return this.#module.type.toUpperCase().split(" ");
    }

}

class Modules {
    moduleClasses = {};
    uniqueModuleClasses = {};
    #modules = new Map();

    getAllModuleNamespaces() {
        return Object.keys(this.moduleClasses);
    }

    addIOHandler(module, channel, callback, socket) {
        let uuid = module.namespace + ":" + module.id;

        socket.on(uuid + " " + channel, callback);
    }

    emitIO(module, channel, data, socket = module.holder.sockets) {
        let uuid = module.namespace + ":" + module.id;

        if (Array.isArray(socket)) {
            socket.forEach((sock) => {
                sock.emit(uuid + " " + channel, data);
            })
        } else {
            socket.emit(uuid + " " + channel, data);
        }
    }

    emitDockIO(module, channel, data, socket = module.holder.dockSockets) {
        let uuid = module.namespace + ":" + module.id;

        if (Array.isArray(socket)) {
            socket.forEach((sock) => {
                sock.emit(uuid + " " + channel, data);
            })
        } else {
            socket.emit(uuid + " " + channel, data);
        }
    }

    getFromUUID(target) {
        let holder = this.#modules.get(target);

        if (holder) {
            return holder.getInstance();
        } else {
            return null;
        }
    }

    getHolderFromUUID(target) {
        let holder = this.#modules.get(target);

        if (holder) {
            return holder;
        } else {
            return null;
        }
    }

    saveToStore(module) {
        try {
            const path = `modules.${module.namespace}.${module.id}`;
            const data = module.getDataToStore() ?? {};

            data.__module = {
                customdisplayname: module.customdisplayname
            };

            CAFFEINATED.store.set(path, data);

            console.debug(`Save succeeded. (${module.namespace}:${module.id})`);
        } catch (e) {
            console.error("Unable to save module");
            console.error(e);
        }
    }

    getAllModules(excludePersist) {
        const copy = [];

        Array.from(this.#modules.values())
            .forEach((holder) => {
                if (!excludePersist || !holder.getInstance().persist) {
                    copy.push(holder);
                }
            });

        return copy;
    }

    async createNewModuleInstance(namespace, name) {
        const clazz = this.moduleClasses[namespace];
        const id = generateUUID();

        const module = new clazz(id);

        module.displayname = name;
        module.customdisplayname = name;

        await this.initalizeModule(module);

        this.saveToStore(module);

        return module;
    }

    async deleteModuleInstance(module, namespace = module.namespace, id = module.id) {
        const uuid = `${namespace}:${id}`;
        const holder = this.getHolderFromUUID(uuid);

        if (holder.getInstance().persist) {
            throw "Module is a persistient module.";
        } else {
            this.#modules.delete(uuid);
            holder.unload();

            const path = `modules.${namespace}.${id}`;

            CAFFEINATED.store.delete(path);

            koi.broadcast("module_unload", uuid);
        }
    }

    async initalizeModule(module) {
        try {
            const holder = new ModuleHolder(module);
            const types = holder.getTypes();

            const customdisplayname = CAFFEINATED.store.get(`modules.${module.namespace}.${module.id}.__module.customdisplayname`);

            if (customdisplayname) {
                module.customdisplayname = customdisplayname;
            }

            module.holder = holder;

            // Initialize pages, this is ugly yet intentional.
            // Overlay's cannot have a page nor settings box,
            // the module is given it's page with the settings attributes filled (if requested)
            if (types.includes("OVERLAY")) {
                this.initalizeModuleWidgetPage(module);

                if (types.includes("SETTINGS")) {
                    module.page.classList.add("widget-settings-page");

                    await this.initalizeModuleSettingsPage(module, module.page, true);
                }
            } else if (types.includes("APPLICATION")) {
                if (types.includes("SETTINGS")) {
                    module.settingsPage = this.createPage(module);

                    const selector = `${module.namespace}-${module.id}`;

                    module.settingsPage.appendChild(document.createElement("br"));

                    await this.initalizeModuleSettingsPage(module, module.settingsPage, false);

                    if (!module.widgetDisplay) {
                        module.widgetDisplay = [];
                    }

                    module.widgetDisplay.push({
                        name: "Settings",
                        icon: "settings",
                        onclick(instance) {
                            navigate(selector);
                        }
                    });
                }

                this.initalizeModulePage(module);

                if (module.pageSrc) {
                    await this.createContentFrame(module.page, module.pageSrc, "moduleframe");
                }
            } else if (types.includes("SETTINGS")) {
                await this.initalizeModuleSettingsPage(module);
            }

            LANG.translate(module.page);

            if (module.init) await module.init();

            this.#modules.set(holder.getUUID(), holder);

            koi.broadcast("module_load", holder);
        } catch (e) {
            console.error("Unable to initalize module due to an exception:");
            console.error(e);
        }
    }

    createContentFrame(page, src, classList = "") {
        return new Promise(async (resolve) => {
            const frame = document.createElement("iframe");
            const contents = await this.loadContents(src);

            frame.classList = classList;

            page.appendChild(frame);

            frame.addEventListener("load", () => resolve(frame));

            frame.contentDocument.open();
            frame.contentDocument.write(contents);
            frame.contentDocument.close();
        });
    }

    loadContents(src) {
        return new Promise((resolve) => {
            fetch(src)
                .then((response) => response.text())
                .then((contents) => {
                    resolve(contents);
                }).catch((err) => {
                    resolve("An error occurred whilst loading " + src);
                });
        });
    }

    initalizeModulePage(module) {
        module.page = this.createPage(module, true);

        const selector = `${module.namespace}-${module.id}-application-page`;
        const name = module.displayname ? module.displayname : prettifyString(module.id);

        let li = document.createElement("li");
        let a = document.createElement("a");
        let ion = document.createElement("ion-icon");
        let text = document.createElement("div");
        let icons = document.createElement("div");

        li.appendChild(a);
        li.style = "position: relative;";
        li.setAttribute("id", "menu-" + selector);

        // Setting hidden icon. On hide() => $("#menu-ion-icon").remove("hide")
        ion.setAttribute("name", module.icon);
        ion.setAttribute("id", "menu-ion-icon");
        ion.classList.add("hide");

        text.classList.add("menu-button-title");
        text.innerText = name;

        if (module.displayname) {
            text.classList.add("translatable");
            text.setAttribute("lang", module.displayname);
        }

        icons.classList = "button-icon dropdown-icon";

        if (module.widgetDisplay) {
            for (const display of module.widgetDisplay) {
                let peeper = document.createElement("a");
                let ion = document.createElement("ion-icon");

                ion.setAttribute("name", display.icon);

                peeper.appendChild(ion);
                peeper.setAttribute("title", display.name);
                peeper.addEventListener("click", () => {
                    display.onclick(module);
                });

                icons.appendChild(peeper);
            }
        }

        a.classList.add("menu-button");
        a.addEventListener("click", () => navigate(selector));
        a.appendChild(ion);
        a.appendChild(text);
        a.appendChild(icons);

        document.querySelector("#page-menu").insertBefore(li, document.querySelector("#page-menu").lastChild);

        LANG.translate(li);
    }

    initalizeModuleWidgetPage(module) {
        module.page = this.createPage(module);

        let selector = module.namespace + "-" + module.id;
        let name = module.displayname ? module.displayname : prettifyString(module.id);

        let div = document.createElement("div");
        let title = document.createElement("div");
        let a = document.createElement("a");
        let icons = document.createElement("div");

        a.innerText = name;
        a.addEventListener("click", () => navigate(selector));

        title.classList.add("dropdown-title");
        title.appendChild(a);

        if (module.displayname) {
            a.classList = "translatable";
            a.setAttribute("lang", name);

            LANG.translate(title);
        }

        icons.classList.add("dropdown-icon");

        if (module.widgetDisplay) {
            for (const display of module.widgetDisplay) {
                let peeper = document.createElement("a");
                let ion = document.createElement("ion-icon");

                ion.setAttribute("name", display.icon);

                peeper.appendChild(ion);
                peeper.setAttribute("title", display.name);
                peeper.addEventListener("click", () => {
                    display.onclick(module);
                });

                icons.appendChild(peeper);
            }
        }

        if (module.supportedPlatforms) {
            koi.addEventListener("kofi_update", (event) => {
                const platform = CAFFEINATED.userdata && module.supportedPlatforms.includes(CAFFEINATED.userdata.streamer.platform);
                const kofi = module.supportedPlatforms.includes("KO_FI") && event.enabled;

                module.isEnabled = platform || kofi;

                if (module.isEnabled) {
                    div.classList.remove("hide");
                } else {
                    div.classList.add("hide");
                }
            });

            koi.addEventListener("user_update", (event) => {
                const platform = module.supportedPlatforms.includes(event.streamer.platform);
                const kofi = module.supportedPlatforms.includes("KO_FI") && KOFI_ENABLED;

                module.isEnabled = platform || kofi;

                if (module.isEnabled) {
                    div.classList.remove("hide");
                } else {
                    div.classList.add("hide");
                }
            });
        }

        div.classList.add("dropdown-item");
        div.appendChild(title);
        div.appendChild(icons);

        document.getElementById("widgets").appendChild(div);
        module.holder.associateElement(div);
    }

    createPage(module, isAppPage) {
        let selector = module.namespace + "-" + module.id;

        if (isAppPage) {
            selector = selector + "-application-page"
        }

        const name = module.displayname ? module.displayname : prettifyString(module.id);

        const page = document.createElement("div");

        page.setAttribute("page", selector);
        page.setAttribute("navbar-title", name);
        page.classList = "content page hide";

        document.querySelector(".pages").appendChild(page);
        module.holder.associateElement(page);

        return page;
    }

    async initalizeModuleSettingsPage(module, parent = document.getElementById("settings"), isWidget) {
        const settingsSelector = module.namespace + "_" + module.id;

        const name = module.displayname ? module.displayname : prettifyString(module.id);
        const stored = this.getStoredValues(module);
        const container = document.createElement("div");
        const div = document.createElement("div");
        const label = document.createElement("label");

        if (!module.page) {
            module.page = container;
        }

        const formCallback = async () => {
            const result = FORMSJS.readForm("#" + settingsSelector);

            module.settings = result;

            if (module.onSettingsUpdate) {
                await module.onSettingsUpdate();
            }

            MODULES.saveToStore(module);
        };

        label.classList.add("settings-label");
        label.innerText = name;

        if (module.displayname) {
            label.setAttribute("lang", module.displayname);
            label.classList.add("translatable");
        }

        div.classList.add("box");
        div.id = settingsSelector;
        div.appendChild(label);

        container.classList.add("settings-page");
        container.appendChild(div);
        container.appendChild(document.createElement("br"));

        for (const [key, type] of Object.entries(module.settingsDisplay)) {
            let data = type;

            if (typeof data === "string") {
                data = {
                    display: prettifyString(key),
                    type: type,
                    isLang: false
                };
            }

            div.appendChild(await createModuleInput(module, key, data, stored, formCallback));
        }

        if (!isWidget && module.supportedPlatforms) {
            koi.addEventListener("user_update", (event) => {
                module.isEnabled = module.supportedPlatforms.includes(event.streamer.platform);

                if (module.isEnabled) {
                    container.classList.remove("hide");
                } else {
                    container.classList.add("hide");
                }
            });
        }

        parent.appendChild(container);
        module.holder.associateElement(container);

        module.settings = stored;

        LANG.translate(parent);
    }

    getStoredValues(module) {
        const stored = CAFFEINATED.store.get("modules." + module.namespace + "." + module.id);
        let data;

        if (stored) {
            for (const [key, value] of Object.entries(module.defaultSettings)) {
                if (typeof stored[key] == "undefined") {
                    stored[key] = value;
                }
            }

            data = stored;
        } else {
            data = Object.assign({}, module.defaultSettings);
        }


        for (const [key, value] of Object.entries(module.defaultSettings)) {
            const type = module.settingsDisplay[key];

            if ((type === "dynamic") || ((typeof type === "object") && !Array.isArray(type) && (type.type === "dynamic)"))) {
                if (!Array.isArray(data[key])) {
                    data[key] = value.default;
                }
            }

        }

        return data;
    }

}

async function createDynamicModuleOption(module, layout, values, formCallback) {
    const display = layout.display;
    const defaults = layout.default;

    const div = document.createElement("div");
    const remove = document.createElement("a");
    const icon = document.createElement("ion-icon");

    div.type = "dynamic";
    div.appendChild(remove);
    div.classList = "box dynamic-option";

    icon.setAttribute("name", "remove-circle");

    remove.appendChild(icon);
    remove.classList = "menu-button dynamic-remove";
    remove.addEventListener("click", () => {
        div.remove();
        formCallback();
    });

    for (const [key, type] of Object.entries(display)) {
        let data = type;

        if (typeof data === "string") {
            data = {
                display: prettifyString(key),
                type: type,
                isLang: false
            };
        }

        div.appendChild(await createModuleInput(module, key, data, values, formCallback, defaults[key]));
    }

    LANG.translate(div);

    return div;
}

async function createModuleInput(module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) {
    const uuid = module.namespace + ":" + module.id;
    const displayname = data.display;
    const isLang = data.isLang;
    const type = data.type;

    let container = document.createElement("span");
    let name = document.createElement("span");
    let input;

    if (type === "textarea") {
        input = document.createElement("textarea");

        input.setAttribute("rows", 3);
    } else if (type === "iframe-src") {
        input = document.createElement("div");

        input.id = uuid;
        input.classList = type + " data";
        input.setAttribute("type", type);
        input.setAttribute("name", key);
        input.setAttribute("owner", module.id);

        const frame = document.createElement("iframe");
        const contents = await MODULES.loadContents(defaultValue);

        let loaded = false;

        input.appendChild(frame);

        frame.classList = "settingsframe";
        frame.style = `height: ${data.height}`;
        frame.addEventListener("load", () => {
            if (!loaded) {
                loaded = true;

                frame.contentDocument.open();
                frame.contentDocument.write(contents);
                frame.contentDocument.close();

                if (module.onFrameLoad) {
                    module.onFrameLoad(frame);
                }
            }
        });

        container.appendChild(input);

        return container;
    } else if (type === "rich") {
        input = document.createElement("div");

        input.id = uuid;
        input.classList = type + " data";
        input.setAttribute("type", type);
        input.setAttribute("name", key);
        input.setAttribute("owner", module.id);

        name.innerText = displayname;

        if (isLang) {
            name.setAttribute("lang", displayname);
            name.classList.add("translatable");
        }

        container.appendChild(name);
        container.appendChild(input);
        container.appendChild(document.createElement("br"));

        QuillUtil.createEditor(input, stored[key], formCallback);

        return container;
    } else if (type === "dynamic") {
        input = document.createElement("div");

        let add = document.createElement("a");
        let icon = document.createElement("ion-icon");

        icon.setAttribute("name", "add-circle");

        add.appendChild(icon);
        add.classList = "menu-button dynamic-add";
        add.addEventListener("click", async () => {
            input.appendChild(await createDynamicModuleOption(module, defaultValue, Object.assign({}, defaultValue.default), formCallback));
            formCallback();
        });

        input.classList = "dynamic-setting data";
        input.id = uuid;
        input.setAttribute("type", type);
        input.setAttribute("name", key);
        input.setAttribute("owner", module.id);

        name.innerText = displayname;

        if (isLang) {
            name.setAttribute("lang", displayname);
            name.classList.add("translatable");
        }

        container.appendChild(name);
        container.appendChild(add);
        container.appendChild(input);
        container.appendChild(document.createElement("br"));

        if (Array.isArray(stored[key])) {
            stored[key].forEach(async (dynamic) => {
                input.appendChild(await createDynamicModuleOption(module, defaultValue, dynamic, formCallback));
            });
        } else {
            stored[key] = [];
        }

        return container;
    } else if (type === "button") {
        input = document.createElement("button");

        input.addEventListener("click", () => defaultValue(module));
        input.innerText = displayname;
        input.id = uuid;
        input.classList = type + " data";
        input.setAttribute("type", type);
        input.setAttribute("name", key);
        input.setAttribute("owner", module.id);

        if (isLang) {
            input.setAttribute("lang", displayname);
            input.classList.add("translatable");
        }

        let div = document.createElement("div");

        div.appendChild(input);
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createElement("br"));

        return div;
    } else if (type === "search") {
        input = document.createElement("div");
    } else if (type === "select") {
        input = document.createElement("select");
    } else if (type === "font") {
        input = document.createElement("div");
    } else if (type === "currency") {
        input = document.createElement("div");
    } else {
        input = document.createElement("input");
    }

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    container.appendChild(name);

    input.id = uuid;
    input.classList = type + " data";
    input.setAttribute("type", type);
    input.setAttribute("name", key);
    input.setAttribute("owner", module.id);
    input.addEventListener("change", formCallback);

    // Make ranges step in .1 intervals
    if (type === "range") {
        input.setAttribute("min", 0);
        input.setAttribute("max", 1);
        input.setAttribute("step", 0.01);
    }

    if (type === "font") {
        input.type = "currency";
        let selected = stored[key];

        SELECTNSEARCH.create(FONTSELECT.fonts, input);

        if (Array.isArray(selected)) {
            selected = FONTSELECT.fonts[0];
        }

        input.setAttribute("value", selected);
        input.querySelector(".sns-input").value = selected;
        input.classList.add("select");

        stored[key] = selected; // Set the selected key
    } else if (type === "currency") {
        let selected = stored[key];

        SELECTNSEARCH.create(CURRENCIES, input);

        if (Array.isArray(selected)) {
            selected = CURRENCIES[0];

            stored[key] = selected; // Set the selected key
        }

        selected = CURRENCY_TABLE_INVERTED[selected];

        input.setAttribute("value", selected);
        input.querySelector(".sns-input").value = selected;
        input.classList.add("select");
    } else if (type === "search") {
        let values = Object.assign([], defaultValue);
        let selected = stored[key];

        SELECTNSEARCH.create(values, input);

        if (Array.isArray(selected)) {
            selected = values[0];
        }

        input.setAttribute("value", selected);
        input.querySelector(".sns-input").value = selected;
        input.classList.add("select");

        stored[key] = selected; // Set the selected key
    } else if (type === "select") {
        input.type = "select";
        let values = Object.assign([], defaultValue);
        let selected = stored[key];
        let options = "";

        if (Array.isArray(selected)) {
            selected = values[0];
        }

        // Loop and mark the selected option, TODO better way.
        values.forEach((value) => {
            if (value === selected) {
                options = options + "<option selected>" + value + "</option>";
            } else {
                options = options + "<option>" + value + "</option>";
            }
        });

        stored[key] = selected; // Set the selected key

        input.innerHTML = options;
    } else if (type === "checkbox") {
        input.checked = stored[key];
    } else if (type !== "file") {
        // You can't set file values, not even in Electron
        input.value = stored[key];
    }

    // keep checkboxes inline
    if (type !== "checkbox") {
        container.appendChild(document.createElement("br"));
    }

    // Make file inputs appear as buttons only.
    if (type === "file") {
        let button = document.createElement("button");

        button.classList.add("file-button");
        button.innerText = "Select a file";
        button.addEventListener("click", () => {
            input.click(); // Forward clicks to the input.
        });

        container.appendChild(button);

        input.classList.add("hide");
    }

    container.appendChild(input);
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));

    return container;
}
