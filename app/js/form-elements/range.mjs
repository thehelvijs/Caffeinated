
const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;

    const container = document.createElement("div");

    container.classList = "module-settings-element";
    container.innerHTML = `
        <span></span>
        <input min="0" step="0.01" max="1" name="${key}" owner="${uuid}" type="range" class="range data" />
    `;

    const name = container.querySelector("span");
    const input = container.querySelector("input");

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    input.value = stored[key];
    input.addEventListener("change", () => formCallback(key, parseFloat(input.value)));

    return container;
};

export default { createElement };

