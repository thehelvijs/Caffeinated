
class Modules {

    constructor() {
        this.moduleClasses = {};
        this.modules = [];
    }

    addIOHandler(module, channel, callback, socket) {
        let uuid = module.namespace + ":" + module.id;

        socket.on(uuid + " " + channel, callback);
    }

    emitIO(module, channel, data, socket = CAFFEINATED.io) {
        let uuid = module.namespace + ":" + module.id;

        socket.emit(uuid + " " + channel, data);
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
            switch (module.type.toUpperCase()) {
                case "OVERLAY": {
                    this.initalizeModuleSettingsPage(module);
                    this.initalizeModuleOverlayPage(module);
                    break;
                }

                case "SETTINGS": {
                    this.initalizeModuleSettingsPage(module);
                    break;
                }

                case "APPLICATION": {
                    // TODO
                    break;
                }
            }

            if (module.init) module.init();

            this.modules.push(module);
        } catch (e) {
            console.error("Unable to initalize module due to an exception:");
            console.error(e);
        }
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
            putInClipboard(linkDisplay.path) + "?id=" + module.id;
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
            let uuid = module.namespace + ":" + module.id;
            let name = document.createElement("label");
            let input = document.createElement("input");

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
                input.setAttribute("step", .01);
            }

            if (type === "checkbox") {
                input.checked = stored[key];
            } else if (type !== "file") { // You can't set file values, not even in Electron
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

            div.appendChild(name);
        }

        document.getElementById("settings").appendChild(container);

        module.settings = stored;
    }

    getStoredValues(module) {
        let stored = CAFFEINATED.store.get("modules." + module.namespace + "." + module.id);

        if (stored) {
            for (const [key, value] of Object.entries(module.defaultSettings)) {
                if (!stored[key]) {
                    stored[key] = value;
                }
            }

            return stored;
        } else {
            return Object.assign({}, module.defaultSettings);
        }
    }

}
