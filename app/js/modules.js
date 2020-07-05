class Modules {
    settingsDisplayClasses = "";
    overlaysDisplayClasses = "";
    moduleTypes = {};
    modules = [];

    saveAllToStore() {
        this.modules.forEach((module) => {
            let path = "modules." + module.type + "." + module.id;

            store.set(path, module.getDataToStore());
        });
    }

    initalizeModule(module, settings = document.querySelector("#settings"), overlays = document.querySelector("#overlays")) {
        try {
            if (module.preInit) module.preInit();
            this.initalizeModuleSettings(module, settings, overlays);
            if (module.onInit) module.onInit();
            this.initalizeModuleOverlay(module);
            if (module.postInit) module.postInit();

            this.modules.push(module);
        } catch (e) {
            console.error("Unable to initalize module due to an exception:");
            console.error(e);
        }
    }

    initalizeModuleOverlay(module) {
        let linkDisplay = module.linkDisplay;
        let div = document.createElement("div");
        let label = document.createElement("label");
        let copy = document.createElement("button");
        let custom = document.createElement("button");
        let visible = document.createElement("input");

        label.innerText = prettifyString(module.id);

        visible.setAttribute("type", "checkbox");
        visible.addEventListener("change", (e) => {
            module.setWindowVisbility(e.target.checked);
        });

        copy.innerText = "Copy";
        copy.addEventListener("click", () => {
            putInClipboard(linkDisplay.path);
        });

        custom.innerText = linkDisplay.option.name;
        custom.addEventListener("click", linkDisplay.option.onclick);

        div.classList = this.overlaysDisplayClasses;
        div.appendChild(visible);
        div.appendChild(label);
        div.appendChild(copy);
        div.appendChild(custom);

        overlays.appendChild(div);
    }

    initalizeModuleSettings(module) {
        const settingsSelector = module.name + "_" + module.id;
        let stored = this.getStoredValues(module);
        let div = document.createElement("div");
        let label = document.createElement("label");

        let formCallback = () => {
            let result = FORMSJS.readForm("#" + settingsSelector);

            module.settings = result;

            if (module.onSettingsUpdate) {
                module.onSettingsUpdate();
            }
        };

        label.innerText = prettifyString(module.type);

        div.classList = this.settingsDisplayClasses;
        div.id = settingsSelector;
        div.appendChild(label);
        div.appendChild(document.createElement("br"));

        for (const [key, type] of Object.entries(module.settingsDisplay)) {
            let name = document.createElement("label");
            let input = document.createElement("input");

            name.innerText = prettifyString(key) + " ";

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

            name.appendChild(input);
            name.appendChild(document.createElement("br"));

            // Add an extra br, since other inputs don't line break
            if (type !== "file") {
                name.appendChild(document.createElement("br"));
            }

            div.appendChild(name);
        }

        settings.appendChild(div);

        module.settings = stored;
    }

    getStoredValues(module) {
        let stored = store.get("modules." + module.type + "." + module.id);

        if (stored) {
            for (const [key, value] of Object.entries(module.defaultSettings)) {
                if (!stored[key]) {
                    stored[key] = value;
                }
            }

            return stored;
        } else {
            return module.defaultSettings;
        }
    }

}

const MODULES = new Modules();
