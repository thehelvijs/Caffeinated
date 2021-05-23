
const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;

    const container = document.createElement("div");

    container.classList = "module-settings-element";
    container.innerHTML = `
        <span></span>
        <button class="file-button button data" name="${key}" owner="${uuid}">Select a file</button>
        <input type="file" class="hide" />
    `;

    const name = container.querySelector("span");
    const input = container.querySelector("input");
    const button = container.querySelector("button");

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    button.addEventListener("click", () => {
        input.click(); // Forward clicks to the input.
    });

    input.addEventListener("change", () => formCallback(key, input));

    return container;
};

export default { createElement };

