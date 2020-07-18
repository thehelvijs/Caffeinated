
function prettifyString(str) {
    let splitStr = str.split("_");

    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(" ");
}

function putInClipboard(copy) {
    navigator.clipboard.writeText("http://127.0.0.1:" + store.get("host_port") + "/" + copy);
}

function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        console.log(file);

        reader.readAsDataURL(file.files[0]);
        reader.onload = () => resolve(reader.result);
    });
}

function playAudio(b64, vol) {
    let audio = new Audio(b64);

    audio.volume = vol;
    audio.play();
}