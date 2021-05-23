
const createElement = (module, key, data, stored, mainFormCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;

    const container = document.createElement("div");
    const name = document.createElement("span");
    const dynamics = document.createElement("div");
    const add = document.createElement("a");
    const icon = document.createElement("ion-icon");

    icon.setAttribute("name", "add-circle");

    let dynamicData = {};

    function formCallback() {
        mainFormCallback(key, Object.values(dynamicData));
    }

    async function createDynamicModuleOption(module, layout, values) {
        const childUuid = generateUUID();

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
            delete dynamicData[childUuid];
            formCallback();
        });

        dynamicData[childUuid] = values;

        for (const [key, type] of Object.entries(display)) {
            let data = type;

            if (typeof data === "string") {
                data = {
                    display: prettifyString(key),
                    type: type,
                    isLang: false
                };
            }

            function childElementCallback(key, value) {
                dynamicData[childUuid][key] = value;

                formCallback();
            }

            const container = await FormElements.getModuleElement(module, key, data, dynamicData[childUuid], childElementCallback, defaults[key]);

            div.appendChild(container);
        }

        LANG.translate(div);

        return div;
    }

    add.appendChild(icon);
    add.classList = "menu-button dynamic-add";
    add.addEventListener("click", async () => {
        dynamics.appendChild(await createDynamicModuleOption(module, defaultValue, Object.assign({}, defaultValue.default)));
        formCallback();
    });

    dynamics.classList = "dynamic-setting data";
    dynamics.id = uuid;
    dynamics.setAttribute("type", "dyamic");
    dynamics.setAttribute("name", key);
    dynamics.setAttribute("owner", module.id);

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    container.appendChild(name);
    container.appendChild(add);
    container.appendChild(dynamics);

    if (Array.isArray(stored[key])) {
        stored[key].forEach(async (dynamic) => {
            dynamics.appendChild(await createDynamicModuleOption(module, defaultValue, dynamic));
        });
    } else {
        stored[key] = [];
    }

    return container;
};

export default { createElement };

