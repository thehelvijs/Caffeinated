const FILE_SIZE_THRESHOLD = 1048576 * 10; // 10mb

function createSandboxedIframe(src, onLoadListener) {
    const div = document.createElement("div");

    let frame = null;

    let moduleListeners = {};

    div.style = `width: 100%; height: 100%;`;

    const reload = async () => {
        frame?.remove();
        frame = document.createElement("iframe");
        frame.style = `width: 100%; height: 100%;`;
        frame.sandbox = `allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-scripts`;

        div.appendChild(frame);

        // Proxy all calls through postMessage.
        const invokable = new Invokable((data) => {
            frame.contentWindow.postMessage(data, "*");
        }, generateUUID());

        window.addEventListener("message", (event) => {
            if (invokable.trigger(event.data)) {
                console.debug(`[Module Sandbox, (${invokable.id}) -> Outside]`, event.data)
            }
        });

        const CaffeinatedWindow = {
            reload: () => {
                reload();
            },
            openLink: (link) => {
                openLink(link);
            },
            emit: (type, data) => {
                const listeners = moduleListeners[type.toLowerCase()];

                if (listeners) {
                    listeners.forEach((callback) => {
                        try {
                            callback(data);
                        } catch (e) {
                            console.error("A frame event listener produced an exception: ");
                            console.error(e);
                        }
                    });
                }
            },

            ...invokable.funcs("loadDocumentContent", "eval")
        };

        invokable.target = CaffeinatedWindow;

        // Add helpers for exposing the frame to the outside.
        frame.CaffeinatedWindow = CaffeinatedWindow;

        frame.on = (type, callback) => {
            type = type.toLowerCase();

            let callbacks = moduleListeners[type];

            if (!callbacks) callbacks = [];

            callbacks.push(callback);

            moduleListeners[type] = callbacks;
        };

        frame.emit = (type, data) => {
            invokable.callFunc("broadcast", type, data);
        };

        if (onLoadListener) {
            onLoadListener(frame);
        }

        let alreadyLoadedSrc = false;

        frame.on("document_content_load", async () => {
            if (src && !alreadyLoadedSrc) {
                alreadyLoadedSrc = true;

                const contents = await (await fetch(src)).text();

                CaffeinatedWindow.loadDocumentContent(contents);
            }
        });

        // Load the sandbox helper.
        frame.src = `${__dirname}/sandbox.html?${invokable.id}`;
    };

    reload();

    return div;
}

function createLoosePromise() {
    let resolve;
    let reject;

    let promise = new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });

    Object.defineProperty(promise, "resolve", {
        get: () => {
            return resolve;
        }
    });

    Object.defineProperty(promise, "reject", {
        get: () => {
            return reject;
        }
    });

    return promise;
}

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

    if (splitStr.length == 0) {
        return splitStr[0].charAt(0).toUpperCase() + splitStr[0].substring(1);
    } else {
        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }

        return splitStr.join(" ");
    }
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

function getFriendlyTime(millis) {
    return new Date(millis).toISOString().substr(11, 8);
}
