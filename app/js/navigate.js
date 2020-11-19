
function navigate(page) {
    let selector = "[page='" + page + "']";

    // Check if already active page is navigated (to stop double loading content)
    let isActive = false;
    Array.from(document.querySelectorAll(".page")).forEach((e) => {
        if (!(e.classList.contains("hide")) && e.getAttribute("page") == page) {
            isActive = true;
        }
    });

    if (!isActive) {
        anime({
            targets: ".page",
            easing: "linear",
            opacity: 0,
            duration: 100
        }).finished.then(() => {
            Array.from(document.querySelectorAll(".page")).forEach((e) => {
                if (e.getAttribute("page") != page) {
                    e.classList.add("hide");
                    // Remove active class from menu button
                    try {
                        document.getElementById("menu-" + e.getAttribute("page")).classList.remove("active");
                    } catch (e) { }
                }
            });

            // Sets menu button active class 
            // Try/catch in case if 'navigate' is triggered from outside side-menu
            try {
                document.getElementById("menu-" + page).classList.add("active");
            } catch (e) { }

            document.querySelector(selector).classList.remove("hide");

            anime({
                targets: selector,
                easing: "linear",
                opacity: 1,
                duration: 100
            });

            // (Helvijs) Title is not needed as there is active menu button
            // But once menu hiding is added, the title could be on top of content page
            // let title = document.querySelector(selector).getAttribute("navbar-title");
            // if (title) {
            //     document.querySelector(".currentpage").innerText = title;
            // } else {
            //     document.querySelector(".currentpage").innerText = prettifyString(page);
            // }
        });
    }
}

function splashText(text) {
    anime({
        targets: ".splash-message",
        easing: "linear",
        opacity: 0,
        duration: 500
    }).finished.then(() => {
        if (text != null) {
            document.querySelector(".splash-message").innerHTML = text;

            anime({
                targets: ".splash-message",
                easing: "linear",
                opacity: 1,
                duration: 500
            });
        }
    });
}

function splashScreen(show) {
    if (!show) {
        document.querySelector("#content").classList.remove("hide");
    }

    anime({
        targets: "#content",
        easing: "linear",
        opacity: show ? 0 : 1,
        duration: 500
    }).finished.then(() => {
        if (show) {
            document.querySelector("#content").classList.add("hide");
        }
    });

    anime({
        targets: "#splash",
        easing: "linear",
        opacity: show ? 1 : 0,
        duration: 500
    });
}
