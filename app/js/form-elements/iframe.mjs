
const createElement = async (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;

    const frame = document.createElement("iframe");
    const contents = await MODULES.loadContents(defaultValue);

    let loaded = false;

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

    const container = document.createElement("div");

    container.id = uuid;
    container.classList = "module-settings-element iframe-src data";
    container.setAttribute("name", key);
    container.setAttribute("owner", module.id);

    container.appendChild(frame);

    return container;
};

export default { createElement };

