class Modules {
    constructor() {
        this.moduleClasses = {};
        this.modules = [];
    }

    addIOHandler(module, channel, callback, socket) {
        let uuid = module.namespace + ":" + module.id;

        socket.on(uuid + " " + channel, callback);
    }

    emitIO(module, channel, data, socket = module.sockets) {
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
        return new Promise((resolve) => {
            this.modules.forEach((module) => {
                let uuid = module.namespace + ":" + module.id;

                if (uuid == target) {
                    resolve(module);
                }
            });

            resolve(null);
        });
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
            const type = module.type.toUpperCase();

            // Initialize pages, this is ugly yet intentional.
            if (type.includes("OVERLAY")) {
                this.initalizeModuleOverlayPage(module);
            }

            if (type.includes("SETTINGS")) {
                this.initalizeModuleSettingsPage(module);
            }

            if (type.includes("APPLICATION")) {
                this.initalizeModulePage(module);
            }

            module.sockets = [];

            if (module.init) module.init();

            this.modules.push(module);
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

        li.appendChild(a);

        a.appendChild(ion);
        a.classList.add("menu-button");
        a.addEventListener("click", () => navigate(selector));
        a.setAttribute("title", name);

        ion.setAttribute("name", module.icon);

        page.setAttribute("page", selector);
        page.classList.add("content");
        page.classList.add("page");
        page.classList.add("hide");

        if (module.displayname) {
            page.setAttribute("navbar-title", module.displayname);
            a.setAttribute("title", module.displayname);
        }


        module.page = page;

        document.querySelector("#page-menu").insertBefore(li, document.querySelector("#page-menu").firstChild);
        document.querySelector(".pages").appendChild(page);
    }

    initalizeModuleOverlayPage(module) {
        let linkDisplay = module.linkDisplay;
        let div = document.createElement("div");
        let label = document.createElement("label");
        let copy = document.createElement("button");
        let custom = document.createElement("button");
        // let visible = document.createElement("input");

        label.classList.add("overlay-id");
        label.innerText = prettifyString(module.id);

        /* visible.setAttribute("type", "checkbox");
        visible.addEventListener("change", (e) => {
            module.setWindowVisbility(e.target.checked);
        }); */

        copy.classList.add("button");
        copy.innerText = "Copy";
        copy.addEventListener("click", () => {
            putInClipboard(linkDisplay.path + "?id=" + module.id);
        });

        custom.classList.add("button");
        custom.innerText = linkDisplay.option.name;
        custom.addEventListener("click", () => {
            linkDisplay.option.onclick(module);
        });

        // div.appendChild(visible);
        div.appendChild(label);
        div.appendChild(copy);
        div.appendChild(custom);

        document.getElementById("overlays").appendChild(div);
    }

    initalizeModuleSettingsPage(module) {
        const settingsSelector = module.namespace + "_" + module.id;
        let stored = this.getStoredValues(module);
        let container = document.createElement("div");
        let div = document.createElement("div");
        let label = document.createElement("label");

        let formCallback = async function () {
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
            div.appendChild(createInput(module, key, type, stored, formCallback));
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

function createDynamicOption(module, layout, values, formCallback) {
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
        div.appendChild(createInput(module, key, type, values, formCallback, defaults[key]));
    }

    return div;
}

function createInput(module, key, type, stored, formCallback, defaultValue = module.defaultSettings[key]) {
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
            input.appendChild(createDynamicOption(module, defaultValue, defaultValue.default, formCallback));
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
                input.appendChild(createDynamicOption(module, defaultValue, dynamic, formCallback));
            });
        }

        return name;
    } else if (type === "button") {
        input = document.createElement("button");

        input.addEventListener("click", stored[key]);
        input.innerText = prettifyString(key);
        input.id = uuid;
        input.classList = type + " data";
        input.setAttribute("type", type);
        input.setAttribute("name", key);
        input.setAttribute("owner", module.id);

        return input;
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
        let id = module.namespace + ":" + module.id + ":" + key;
        let data = document.createElement("datalist");

        FONTSELECT.apply(data);

        input.setAttribute("list", id);
        input.classList.add("select");
        input.value = stored[key];
        makeDatalistOpenOnSingleClick(input);

        data.id = id;
        name.appendChild(data);
    } else if (type === "currency") {
        let id = module.namespace + ":" + module.id + ":" + key;
        let data = document.createElement("datalist");
        let selected = stored[key];
        let options = "<option>" + CURRENCIES.join("</option><option>") + "</option>";

        if (Array.isArray(selected)) {
            selected = CURRENCIES[0];
        }

        input.setAttribute("list", id);
        input.value = CURRENCY_TABLE_INVERTED[selected];
        input.classList.add("select");
        makeDatalistOpenOnSingleClick(input);

        stored[key] = selected; // Set the selected key

        data.innerHTML = options;
        data.id = id;

        name.appendChild(data);
    } else if (type === "select") {
        let id = module.namespace + ":" + module.id + ":" + key;
        let data = document.createElement("datalist");
        let values = Object.assign([], defaultValue);
        let selected = stored[key];
        let options = "<option>" + values.join("</option><option>") + "</option>";

        if (Array.isArray(selected)) {
            selected = values[0];
        }

        input.setAttribute("list", id);
        input.value = selected;
        makeDatalistOpenOnSingleClick(input);

        stored[key] = selected; // Set the selected key

        data.innerHTML = options;
        data.id = id;

        name.appendChild(data);
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

function makeDatalistOpenOnSingleClick(input) {
    let temp = "";

    input.addEventListener("mouseover", () => {
        input.focus();
        temp = input.value;
    });
    input.addEventListener("mousedown", () => {
        input.value = "";
    });
    input.addEventListener("mouseup", () => {
        input.value = temp;
        temp = "";
    });
}