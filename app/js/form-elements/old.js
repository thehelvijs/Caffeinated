const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
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
};


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

        const container = await FormElements.getModuleElement(module, key, data, values, formCallback, defaults[key]);

        div.appendChild(container);
    }

    LANG.translate(div);

    return div;
}


export {
    createElement
};

