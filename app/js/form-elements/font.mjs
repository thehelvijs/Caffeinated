
const createElement = (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const uuid = `${module.namespace}:${module.id}`;
    const displayname = data.display;
    const isLang = data.isLang;

    const container = document.createElement("div");

    container.classList = "module-settings-element";
    container.innerHTML = `
        <span></span>
        <div name="${key}" owner="${uuid}" type="search" class="search data"></div>
    `;

    const name = container.querySelector("span");
    const input = container.querySelector(".search");

    name.innerText = displayname;

    if (isLang) {
        name.setAttribute("lang", displayname);
        name.classList.add("translatable");
    }

    input.addEventListener("change", () => {
        const value = input.getAttribute("value");

        if (value) {
            formCallback(key, value);
        }
    });

    let selected = stored[key];

    SELECTNSEARCH.create(FONTSELECT.fonts, input);

    input.setAttribute("value", selected);
    input.querySelector(".sns-input").value = selected;
    input.classList.add("select");

    return container;
};

export default { createElement };

