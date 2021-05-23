
const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;

    const container = document.createElement("div");

    container.classList = "module-settings-element";
    container.innerHTML = `
        <button class="button data" name="${key}" owner="${uuid}"></button>
    `;

    const button = container.querySelector("button");

    button.innerText = displayname;

    if (isLang) {
        button.setAttribute("lang", displayname);
        button.classList.add("translatable");
    }

    button.addEventListener("click", () => defaultValue(module));

    return container;
};

export default { createElement };

