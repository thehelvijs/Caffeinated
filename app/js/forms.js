// https://github.com/e3ndr/FormsJS/blob/master/forms.js - MIT
const FORMSJS = {
    // 1.1.0 MODIFIED

    CLASS_SELECTOR: "data",
    NAME_PROPERTY: "name",
    BLANK_IS_NULL: false,
    PARSE_NUMBERS: true,
    ALLOW_FALSE: true,

    readForm(selector) {
        let parent = document.querySelector(selector);

        if (parent) {
            let values = {};

            Array.from(parent.getElementsByClassName(this.CLASS_SELECTOR)).forEach((element) => {
                let name = element[this.NAME_PROPERTY];

                if (name && !values[name]) {
                    let value = this.getElementValue(element);

                    if (this.BLANK_IS_NULL && (value != null) && (value.length == 0)) {
                        value = null;
                    } else if ((value === false) && !this.ALLOW_FALSE) {
                        return;
                    } else if (this.PARSE_NUMBERS) {
                        let num = parseFloat(value);

                        if (!isNaN(num)) {
                            value = num;
                        }
                    }

                    values[name] = value;
                }
            });

            return values;
        } else {
            throw "Selector resulted in no element.";
        }
    },

    getElementValue(element) {
        let type = element.type;

        switch (type) {
            case "radio": {
                if (element.checked) {
                    return element.value;
                }
            }

            case "checkbox":
                return element.checked;

            case "file":
                return element;

            default:
                return element.value;
        }
    }

};
