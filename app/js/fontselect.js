const FONTSELECT = {
    version: "1.0.1",
    endPoint: "",
    fonts: [],

    preload() {
        return new Promise((resolve, reject) => {
            /*
            require("font-list").getFonts().then((fonts) => {
                fonts.forEach((font) => {
                    const name = font.replace(/\"/g, "");

                    if (!this.fonts.includes(name)) {
                        this.fonts.push(name);
                    }
                })
            });*/

            fetch(this.endPoint).then((response) => response.json())
                .catch(reject)
                .then(async (fonts) => {
                    let toload = [];

                    // Quickly get a list of fonts ready for the caller.
                    fonts.items.forEach((font) => {
                        const name = font.family;

                        if (!this.fonts.includes(name)) {
                            this.fonts.push(name);
                            toload.push(font);
                        }
                    });

                    for (const font of toload) {
                        const name = font.family;
                        let url;

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
        return new Promise(async (resolve, reject) => {
            // if (element instanceof HTMLSelectElement) {
            if (this.fonts.length == 0) {
                await this.preload();
            }

            SELECTNSEARCH.create(this.fonts, element);

            element.value = settings.selected;
            element.querySelector(".sns-input").setAttribute("value", settings.selected);

            resolve();
            //} else {
            //    reject("Element is not a valid select element");
            //}
        });
    }

};
