
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
