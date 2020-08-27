const FONTSELECT = {
    version: "1.0.1",
    endPoint: "",
    fonts: [],

    preload(quickload = true) {
        const instance = this;

        return new Promise((resolve, reject) => {
            fetch(this.endPoint).then((response) => response.json())
                .catch(reject)
                .then(async (fonts) => {
                    let toload = [];

                    // Quickly get a list of fonts ready for the caller.
                    fonts.items.forEach((font) => {
                        let name = font.family;

                        if (!instance.fonts.includes(name)) {
                            instance.fonts.push(name);
                            toload.push(font);
                        }
                    });

                    if (quickload) resolve();

                    // Asynchronously load fonts one by one (to prevent lag)
                    for (let font of toload) {
                        let name = font.family;
                        let url = null;

                        if (font.files.hasOwnProperty("regular")) {
                            url = font.files.regular;
                        } else {
                            url = Object.entries(font.files)[0][1]; // Get the entries, get the first entry, get the link.
                        }

                        await FONTSELECTUTIL.loadFont(name, url);
                    }

                    // Resolving twice (Assuming quickload = false), is safe.
                    resolve();
                });
        });
    },

    apply(element, settings = { updateFont: true, selected: null }) {
        const instance = this;

        return new Promise(async (resolve, reject) => {
            // if (element instanceof HTMLSelectElement) {
            if (instance.fonts.length == 0) {
                await instance.preload();
            }

            instance.fonts.forEach((name) => { // optgroup functionality removed because we disabled font loading
                // Some browsers will not allow you to style <option> elements directly, but will allow the styling of <optgroup>'s
                // let group = document.createElement("optgroup");
                let option = document.createElement("option");

                // group.style = "font-family: '" + name + "';";
                // group.appendChild(option);

                // option.style = "font-family: '" + name + "';";
                option.innerText = name;

                // element.appendChild(group);
                element.appendChild(option);
            });

            // Removed because we disabled font loading
            /* if (settings.updateFont) {
                element.addEventListener("change", () => {
                    element.style = "font-family: '" + element.value + "';";
                });

                // Update it initially.
                element.style = "font-family: '" + element.value + "';";
            } */

            if (settings.selected) {
                element.value = settings.selected;
            }

            resolve();
            //} else {
            //    reject("Element is not a valid select element");
            //}
        });
    }

};

const FONTSELECTUTIL = {
    loadFont(name, url) {
        return new Promise((resolve) => {
            const font = new FontFace(name, "url(" + url.replace("http:", "https:") + ")");

            document.fonts.add(font);

            font.loaded.then(resolve);
            font.load();
        });
    }
}