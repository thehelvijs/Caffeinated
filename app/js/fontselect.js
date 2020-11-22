const FONTSELECT = {
    version: "1.0.1",
    endPoint: "",
    fonts: [],

    preload() {
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

                    for (let font of toload) {
                        let name = font.family;
                        let url = null;

                        if (font.files.hasOwnProperty("regular")) {
                            url = font.files.regular;
                        } else {
                            url = Object.entries(font.files)[0][1]; // Get the entries, get the first entry, get the link.
                        }

                        const face = new FontFace(name, "url(" + url.replace("http:", "https:") + ")");

                        document.fonts.add(face);
                    }

                    resolve();
                });
        });
    },

    apply(element, settings = { updateFont: true, selected: "Poppins" }) {
        const instance = this;

        return new Promise(async (resolve, reject) => {
            // if (element instanceof HTMLSelectElement) {
            if (instance.fonts.length == 0) {
                await instance.preload();
            }

            SELECTNSEARCH.create(instance.fonts, element);

            element.value = settings.selected;
            element.querySelector(".sns-input").setAttribute("value", settings.selected);

            resolve();
            //} else {
            //    reject("Element is not a valid select element");
            //}
        });
    }

};
