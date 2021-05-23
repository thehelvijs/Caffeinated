
const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;

    const container = document.createElement("div");

    container.classList = "module-settings-element";
    container.innerHTML = `
        <span></span>
        <select name="${key}" owner="${uuid}" class="select data"></select>
    `;

    const name = container.querySelector("span");
    const select = container.querySelector("select");

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    const values = Object.assign([], defaultValue);
    let selected = stored[key];

    if (Array.isArray(selected)) {
        selected = values[0];
        stored[key] = selected; // Set the selected key
    }

    values.forEach((value) => {
        const option = document.createElement("option");

        option.selected = (value === selected);
        option.innerText = value;

        select.appendChild(option);
    });

    select.value = stored[key];
    select.addEventListener("change", () => formCallback(key, select.value));

    return container;
};

export default { createElement };

