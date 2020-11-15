class ModuleHolder {
    #module;
    #sockets = [];
    #elements = [];

    constructor(module, elements) {
        this.#module = module;
        this.#elements = elements;
    }

    getUUID() {
        return this.#module.namespace + ":" + this.#module.id;
    }

    unload() {
        MODULES.saveToStore(this.#module);

        if (this.#module.onUnload) {
            this.#module.onUnload();
        }

        this.#elements.forEach((element) => element.remove());
    }

    getElements() {
        return this.#elements;
    }

    getSockets() {
        return this.#sockets;
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
    #modules = new Map();

    addIOHandler(module, channel, callback, socket) {
        let uuid = module.namespace + ":" + module.id;

        socket.on(uuid + " " + channel, callback);
    }

    emitIO(module, channel, data, socket = module.holder.getSockets()) {
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

    saveToStore(module) {
        try {
            let path = "modules." + module.namespace + "." + module.id;
            let data = module.getDataToStore();

            CAFFEINATED.store.set(path, data);
        } catch (e) {
            console.error("Unable to save module");
            console.error(e);
        }
    }

    initalizeModule(module) {
        try {
            const holder = new ModuleHolder(module);
            const types = holder.getTypes();

            module.holder = holder;

            // Initialize pages, this is ugly yet intentional.
            if (types.includes("OVERLAY")) {
                this.initalizeModuleWidgetPage(module);
            }

            if (types.includes("SETTINGS")) {
                this.initalizeModuleSettingsPage(module);
            }

            if (types.includes("APPLICATION")) {
                this.initalizeModulePage(module);
            }

            if (module.init) module.init();

            this.#modules.set(holder.getUUID(), holder);
        } catch (e) {
            console.error("Unable to initalize module due to an exception:");
            console.error(e);
        }
    }

    initalizeModulePage(module) {
        let selector = module.namespace;
        let name = prettifyString(module.namespace);
        let li = document.createElement("li");
        let a = document.createElement("a");
        let ion = document.createElement("ion-icon");
        let page = document.createElement("div");
        let text = document.createElement("div");

        li.appendChild(a);
        li.setAttribute("id", "menu-" + selector);

        a.appendChild(ion);
        a.classList.add("menu-button");
        a.addEventListener("click", () => navigate(selector));
        a.setAttribute("title", name);

        // Setting hidden icon. On hide() => $("#menu-ion-icon").remove("hide")
        ion.setAttribute("name", module.icon);
        ion.setAttribute("id", "menu-ion-icon");
        ion.classList.add("hide");

        text.classList.add("menu-button-title");
        text.innerHTML = module.displayname;
        a.appendChild(text);

        page.setAttribute("page", selector);
        page.classList.add("content");
        page.classList.add("page");
        page.classList.add("hide");

        if (module.displayname) {
            page.setAttribute("navbar-title", module.displayname);
            a.setAttribute("title", module.displayname);
        }

        module.page = page;

        document.querySelector("#page-menu").insertBefore(li, document.querySelector("#page-menu").lastChild);
        document.querySelector(".pages").appendChild(page);
    }

    initalizeModuleWidgetPage(module) {
        let linkDisplay = module.linkDisplay;
        let div = document.createElement("div");
        let title = document.createElement("div");
        let a = document.createElement("a");
        let icons = document.createElement("div");
        let ion_show = document.createElement("ion-icon");
        let ion_mute = document.createElement("ion-icon");
        let a_show = document.createElement("a");
        let a_mute = document.createElement("a");

        title.classList.add("dropdown-title");
        a.innerHTML = prettifyString(module.id);
        title.appendChild(a);

        icons.classList.add("dropdown-icon");
        a_show.addEventListener("click", () => {
            console.log("show/hide pressed");
        });
        ion_show.setAttribute("name", "eye-outline");
        a_show.appendChild(ion_show);
        icons.appendChild(a_show);


        a_mute.addEventListener("click", () => {
            console.log("mute/unmute pressed");
        });
        ion_mute.setAttribute("name", "volume-high-outline");
        a_mute.appendChild(ion_mute);
        icons.appendChild(a_mute);

        div.classList.add("reset-this");
        div.classList.add("dropdown-item");
        div.appendChild(title);
        div.appendChild(icons);

        document.getElementById("widgets").appendChild(div);

        // let div = document.createElement("div");
        // let label = document.createElement("label");
        // let copy = document.createElement("button");
        // let custom = document.createElement("button");
        // // let visible = document.createElement("input");

        // label.classList.add("overlay-id");
        // label.innerText = prettifyString(module.id);

        // /* visible.setAttribute("type", "checkbox");
        // visible.addEventListener("change", (e) => {
        //     module.setWindowVisbility(e.target.checked);
        // }); */

        // copy.classList.add("button");
        // copy.innerText = "Copy";
        // copy.addEventListener("click", () => {
        //     putInClipboard(linkDisplay.path + "?id=" + module.id);
        // });

        // custom.classList.add("button");
        // custom.innerText = linkDisplay.option.name;
        // custom.addEventListener("click", () => {
        //     linkDisplay.option.onclick(module);
        // });

        // // div.appendChild(visible);
        // div.appendChild(label);
        // div.appendChild(copy);
        // div.appendChild(custom);

        // document.getElementById("overlays").appendChild(div);
    }

    initalizeModuleSettingsPage(module) {
        const settingsSelector = module.namespace + "_" + module.id;
        let stored = this.getStoredValues(module);
        let container = document.createElement("div");
        let div = document.createElement("div");
        let label = document.createElement("label");

        let formCallback = async () => {
            let result = FORMSJS.readForm("#" + settingsSelector);

            module.settings = result;

            if (module.onSettingsUpdate) {
                await module.onSettingsUpdate();
            }

            if (module.getDataToStore) {
                MODULES.saveToStore(module);
            }
        };

        label.classList.add("settings-label");
        label.innerText = prettifyString(module.id);

        div.classList.add("box");
        div.id = settingsSelector;
        div.appendChild(label);

        container.classList.add("settings-page");
        container.appendChild(div);
        container.appendChild(document.createElement("br"));

        for (const [key, type] of Object.entries(module.settingsDisplay)) {
            div.appendChild(createModuleInput(module, key, type, stored, formCallback));
        }

        document.getElementById("settings").appendChild(container);

        module.settings = stored;
    }

    getStoredValues(module) {
        let stored = CAFFEINATED.store.get("modules." + module.namespace + "." + module.id);

        if (stored) {
            for (const [key, value] of Object.entries(module.defaultSettings)) {
                if (typeof stored[key] == "undefined") {
                    stored[key] = value;
                }
            }

            return stored;
        } else {
            return Object.assign({}, module.defaultSettings);
        }
    }
}

function createDynamicModuleOption(module, layout, values, formCallback) {
    const display = layout.display;
    const defaults = layout.default;

    let div = document.createElement("div");
    let remove = document.createElement("a");
    let icon = document.createElement("ion-icon");

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
        div.appendChild(createModuleInput(module, key, type, values, formCallback, defaults[key]));
    }

    return div;
}

function createModuleInput(module, key, type, stored, formCallback, defaultValue = module.defaultSettings[key]) {
    let uuid = module.namespace + ":" + module.id;
    let name = document.createElement("label");
    let input;

    if (type === "dynamic") {
        input = document.createElement("div");

        let add = document.createElement("a");
        let icon = document.createElement("ion-icon");

        icon.setAttribute("name", "add-circle");

        add.appendChild(icon);
        add.classList = "menu-button dynamic-add";
        add.addEventListener("click", () => {
            input.appendChild(createDynamicModuleOption(module, defaultValue, defaultValue.default, formCallback));
            formCallback();
        });

        input.classList = "dynamic-setting data";
        input.id = uuid;
        input.appendChild(add);
        input.setAttribute("type", type);
        input.setAttribute("name", key);
        input.setAttribute("owner", module.id);

        name.innerText = prettifyString(key) + " ";
        name.appendChild(input);
        name.appendChild(document.createElement("br"));

        if (Array.isArray(stored[key])) {
            stored[key].forEach((dynamic) => {
                input.appendChild(createDynamicModuleOption(module, defaultValue, dynamic, formCallback));
            });
        }

        return name;
    } else if (type === "button") {
        input = document.createElement("button");

        input.addEventListener("click", defaultValue);
        input.innerText = prettifyString(key);
        input.id = uuid;
        input.classList = type + " data";
        input.setAttribute("type", type);
        input.setAttribute("name", key);
        input.setAttribute("owner", module.id);

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

    name.innerText = prettifyString(key) + " ";

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
        }

        input.setAttribute("value", selected);
        input.querySelector(".sns-input").value = selected;
        input.classList.add("select");

        stored[key] = selected; // Set the selected key
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
        name.appendChild(document.createElement("br"));
    }

    // Make file inputs appear as buttons only.
    if (type === "file") {
        let button = document.createElement("button");

        button.classList.add("file-button");
        button.innerText = "Select a file";
        button.addEventListener("click", () => {
            input.click(); // Forward clicks to the input.
        });

        name.appendChild(button);

        input.classList.add("hide");
    }

    name.appendChild(input);
    name.appendChild(document.createElement("br"));
    name.appendChild(document.createElement("br"));

    return name;
}
