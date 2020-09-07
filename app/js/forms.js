// https://github.com/e3ndr/FormsJS/blob/master/forms.js - MIT
const FORMSJS = {
    // 1.1.0 MODIFIED HEAVILY

    CLASS_SELECTOR: "data",
    NAME_PROPERTY: "name",
    BLANK_IS_NULL: false,
    PARSE_NUMBERS: false,
    ALLOW_FALSE: true,

    readForm(selector, query = document, parent = query.querySelector(selector)) {
        if (parent) {
            let values = {};

            Array.from(parent.getElementsByClassName(this.CLASS_SELECTOR)).forEach((element) => {
                let name = element.getAttribute(this.NAME_PROPERTY);

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
        let type = element.getAttribute("type");

        switch (type) {
            case "currency": {
                return CURRENCY_TABLE[element.getAttribute("value")];
            }

            case "radio": {
                if (element.checked) {
                    return element.value;
                }
            }

            case "dynamic": {
                let options = [];

                Array.from(element.querySelectorAll(".dynamic-option")).forEach((dyn) => {
                    options.push(FORMSJS.readForm(null, element, dyn));
                });

                return options;
            }

            case "checkbox":
                return element.checked;

            case "file":
                return element;

            case "select":
                return element.getAttribute("value");

            case "font":
                return element.getAttribute("value");

            default:
                return element.value;
        }
    }

};
