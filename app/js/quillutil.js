
const QuillUtil = {
    fontSizes: ["8px", "9px", "10px", "12px", "14px", "16px", "20px", "24px", "32px", "42px", "54px", "68px", "84px", "98px"],
    colors: ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", "custom-color"],
    // fonts: [], // TODO

    getCustomColor() {
        return new Promise((resolve) => {
            const element = document.createElement("input");

            element.value = "#e94b4b";
            element.setAttribute("type", "color");
            element.addEventListener("change", () => {
                resolve(element.value);
            });

            element.click();
        });
    },

    createEditor(element, value, callback) {
        const inner = document.createElement("div");

        inner.classList.add("rich-editor");

        element.appendChild(inner);

        element.addEventListener("DOMNodeInsertedIntoDocument", () => {
            const quill = new Quill(inner, {
                modules: {
                    toolbar: {
                        container: [
                            // [{ "font": QuillUtil.fonts }],
                            [{ "size": QuillUtil.fontSizes }],
                            [{ "align": [] }],
                            [{ "color": QuillUtil.colors }, { "background": QuillUtil.colors }],
                            ["bold", "italic", "underline"],
                            ["clean"]
                        ],
                        handlers: {
                            "color": (value) => {
                                if (value == "custom-color") {
                                    QuillUtil.getCustomColor().then((color) => {
                                        quill.format("color", color);
                                    });
                                } else {
                                    quill.format("color", value);
                                }
                            },
                            "background": (value) => {
                                if (value == "custom-color") {
                                    QuillUtil.getCustomColor().then((color) => {
                                        quill.format("background", color);
                                    });
                                } else {
                                    quill.format("background", value);
                                }
                            }
                        }
                    }
                },
                placeholder: "",
                theme: "snow"
            });

            quill.format("color", "#FFFFFF");
            quill.root.innerHTML = value;
            quill.root.addEventListener("blur", callback);
        });
    }

};

(() => {
    let quillSize = Quill.import("attributors/style/size");
    quillSize.whitelist = QuillUtil.fontSizes;
    Quill.register(quillSize, true);
})();