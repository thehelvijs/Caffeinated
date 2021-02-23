const FILE_SIZE_THRESHOLD = 1048576 * 10; // 10mb

function looseInterpret(code, ...args) {
    try {
        return Function(code)(...args);
    } catch (e) {
        if (typeof test === "string") {
            alert(`Uncaught Exception: ${e}`);
        } else {
            alert(`Uncaught ${e.name}: ${e.message}`);
        }
    }
}

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

function fileSizeFormatter(num, decimalPlaces = 1, threshold = 1000) {
    let shortened;
    let mult;

    if ((num >= threshold) && (num >= 1000)) {
        if (num >= 1099511627776) {
            shortened = "Over 1";
            mult = "tb";
        } else if (num >= 1073741824) {
            shortened = (num / 1000000000).toFixed(decimalPlaces);
            mult = "gb";
        } else if (num >= 1048576) {
            shortened = (num / 1000000).toFixed(decimalPlaces);
            mult = "mb";
        } else if (num >= 1024) {
            shortened = (num / 1000).toFixed(decimalPlaces);
            mult = "kb";
        }
    } else {
        shortened = num.toFixed(decimalPlaces);
        mult = "b";
    }

    if (shortened.includes(".")) {
        shortened = shortened.replace(/\.?0+$/, '');
    }

    return shortened + mult;
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

function fileToBase64(fileElement, type) {
    return new Promise((resolve) => {
        const file = fileElement.files[0];
        const size = file.size;

        if (size > FILE_SIZE_THRESHOLD) {
            if (confirm(`The current selected file is greater than 10mb (Actual Size: ${fileSizeFormatter(size, 1)}) which is known to cause issues with Caffeinated.\n\nEither click OK to proceed or click cancel to select a smaller file.`)) {
                console.debug("User OK'd a large file read.");
            } else {
                resolve("");
                fileElement.value = "";
                console.debug("User aborted a large file read.");
                return;
            }
        }

        console.debug(`Reading a ${fileSizeFormatter(size, 1)} file.`)

        try {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result;

                fileElement.value = "";

                if (!type || result.startsWith("data:" + type)) {
                    resolve(result);
                } else {
                    resolve("");
                }
            }
        } catch (e) {
            console.warn(e);
            resolve("");
            fileElement.value = "";
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
