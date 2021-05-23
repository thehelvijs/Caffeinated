import FormButton from "./form-elements/button.mjs";
import FormCheckbox from "./form-elements/checkbox.mjs";
import FormColor from "./form-elements/color.mjs";
import FormCurrency from "./form-elements/currency.mjs";
import FormDynamic from "./form-elements/dynamic.mjs";
import FormFile from "./form-elements/file.mjs";
import FormFont from "./form-elements/font.mjs";
import FormIframe from "./form-elements/iframe.mjs";
import FormNumber from "./form-elements/number.mjs";
import FormPassword from "./form-elements/password.mjs";
import FormRange from "./form-elements/range.mjs";
import FormSearch from "./form-elements/search.mjs";
import FormSelect from "./form-elements/select.mjs";
import FormText from "./form-elements/text.mjs";
import FormTextArea from "./form-elements/textarea.mjs";

const ELEMENTS = {
    "button": FormButton,
    "checkbox": FormCheckbox,
    "color": FormColor,
    "currency": FormCurrency,
    "dynamic": FormDynamic,
    "file": FormFile,
    "font": FormFont,
    "iframe-src": FormIframe,
    "number": FormNumber,
    "password": FormPassword,
    "range": FormRange,
    "search": FormSearch,
    "select": FormSelect,
    "textarea": FormTextArea,
    "text": FormText,

    "input": FormText // Alias of "text"
};

const getModuleElement = async (module, key, data, stored, formCallback, defaultValue = module.defaultSettings[key]) => {
    const { type } = data;

    const FormElement = ELEMENTS[type];

    if (FormElement) {
        return await FormElement.createElement(module, key, data, stored, formCallback, defaultValue);
    } else {
        console.error(`Unknown element type: ${type}`);
        return document.createElement("div");
        // throw `Unknown element type: ${type}`;
    }
};

export default { getModuleElement };

