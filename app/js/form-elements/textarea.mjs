
const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;
    const placeholder = data.placeholder ?? "";
    const rows = data.rows ?? 3;

    const container = document.createElement("div");

    container.classList = "module-settings-element";
    container.innerHTML = `
        <span></span>
        <textarea name="${key}" owner="${uuid}" class="textarea data" />
    `;

    const name = container.querySelector("span");
    const input = container.querySelector("textarea");

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    input.placeholder = placeholder;
    input.rows = rows;
    input.value = stored[key];
    input.addEventListener("change", () => formCallback(key, input.value));

    return container;
};

export default { createElement };

