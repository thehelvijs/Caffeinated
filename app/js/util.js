
function openLink(link) {
    shell.openExternal(link);
}

function kFormatter(num, decimalPlaces = 1, threshold = 1000) {
    const negative = num < 0;
    let shortened;
    let mult;

    num = Math.abs(num);

    if ((num >= threshold) && (num >= 1000)) {
        if (num >= 1000000000000) {
            shortened = "Over 1";
            mult = "t";
        } else if (num >= 1000000000) {
            shortened = (num / 1000000000).toFixed(decimalPlaces);
            mult = "b";
        } else if (num >= 1000000) {
            shortened = (num / 1000000).toFixed(decimalPlaces);
            mult = "m";
        } else if (num >= 1000) {
            shortened = (num / 1000).toFixed(decimalPlaces);
            mult = "k";
        }
    } else {
        shortened = num.toFixed(decimalPlaces);
        mult = "";
    }

    if (shortened.includes(".")) {
        shortened = shortened.replace(/\.?0+$/, '');
    }

    return (negative ? "-" : "") + shortened + mult;
}

function sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

function prettifyString(str) {
    let splitStr = str.split("_");

    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(" ");
}

function putInClipboard(copy) {
    navigator.clipboard.writeText(copy);
}

function fileToBase64(file, type) {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();

            reader.readAsDataURL(file.files[0]);
            reader.onload = () => {
                let result = reader.result;

                file.value = "";

                if (!type || result.startsWith("data:" + type)) {
                    resolve(result);
                } else {
                    resolve("");
                }
            }
        } catch (e) {
            console.warn(e);
            resolve("");
            file.value = "";
        }
    });
}

function playAudio(b64, vol = 1) {
    try {
        let audio = new Audio(b64);

        audio.volume = vol;
        audio.play();

        return audio;
    } catch (e) {
        return {};
    }
}

function nullFields(object, fields) {
    let clone = Object.assign({}, object);

    fields.forEach((field) => {
        clone[field] = null;
    });

    return clone;
}

function removeFromArray(array, item) {
    const index = array.indexOf(item);

    if (index > -1) {
        array.splice(index, 1);
    }

    return array;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
