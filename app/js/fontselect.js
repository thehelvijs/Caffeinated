const FONTSELECT = {
    version: "1.0.1",
    endPoint: "https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyBuFeOYplWvsOlgbPeW8OfPUejzzzTCITM", // TODO cache/proxy from Casterlabs' server
    fonts: [],

    preload() {
        return new Promise(async (resolve, reject) => {
            console.debug("Loading fonts.");

            fetch(this.endPoint).then((response) => response.json())
                .catch(reject)
                .then(async (fonts) => {
                    // let toload = [];

                    // Quickly get a list of fonts ready for the caller.
                    fonts.items.forEach((font) => {
                        const name = font.family;

                        if (!this.fonts.includes(name)) {
                            this.fonts.push(name);
                            // toload.push(font);
                        }
                    });

                    /*
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
                    */

                    try {
                        const localFonts = await require("font-list").getFonts();

                        localFonts.forEach((font) => {
                            const name = font.replace(/\"/g, "");

                            if (!this.fonts.includes(name)) {
                                this.fonts.push(name);

                                // const face = new FontFace(name, font);

                                // document.fonts.add(face);
                            }
                        })
                    } catch (e) {
                        console.error(e);
                    }

                    console.debug("Finished loading fonts.");
                    resolve();
                });
        });
    },

    apply(element, settings = { updateFont: true, selected: "Poppins" }) {
        return new Promise(async (resolve, reject) => {
            // if (element instanceof HTMLSelectElement) {
            if (this.fonts.length == 0) {
                console.debug("No fonts present, loading them now.");
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
