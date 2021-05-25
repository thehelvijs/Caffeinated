
const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;

    const container = document.createElement("div");

    container.classList = "module-settings-element";
    container.innerHTML = `
        <span></span>
        <input name="${key}" owner="${uuid}" type="input" class="input data" />
    `;

    const name = container.querySelector("span");
    const input = container.querySelector("input");

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    input.value = stored[key];
    input.addEventListener("change", () => formCallback(key, input.value));

    return container;
};

export default { createElement };
