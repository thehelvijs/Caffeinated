
function navigate(page) {
    Array.from(document.querySelectorAll(".page")).forEach((e) => {
        e.classList.add("hide");
        e.classList.remove("navigated");
    });

    let element = document.querySelector("[page='" + page + "']");

    element.classList.remove("hide");
    element.classList.add("navigated");
}

let splashActive = true;
function splashScreen(show) {
    let splash = document.getElementById("splash");
    let content = document.getElementById("content");

    if (!show) {
        /* Remove */
        if (splashActive) {
            splash.classList.add("hide");
            content.classList.remove("hide");
        }

        splashActive = false;
    } else {
        /* Generate */
        if (!splashActive) {
            splash.classList.remove("hide");
            content.classList.add("hide");
        }

        splashActive = true;
    }
}
