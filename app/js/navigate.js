
function navigate(page) {
    let selector = "[page='" + page + "']";

    // let isActive = false;
    // Array.from(document.querySelectorAll(".page")).forEach((e) => {
    //     console.log(e.getAttribute("page"))
    //     console.log(page)
    //     console.log()
    //     if (!(e.getAttribute("page") == page) ) {
    //         isActive = true;
    //     }
    // });

    // console.log(document.getAttribute("page"))

    if (true) {
        anime({
            targets: ".page",
            easing: "linear",
            opacity: 0,
            duration: 100
        }).finished.then(function () {
            Array.from(document.querySelectorAll(".page")).forEach((e) => {
                if (e.getAttribute("page") != page) {
                    e.classList.add("hide");
                    // Remove active class from menu button
                    try {
                        document.getElementById("menu-" + e.getAttribute("page")).classList.remove("active");
                    } catch (e) {}
                }
            });
    
            // Sets menu button active class 
            // Try/catch in case if 'navigate' is triggered from outside side-menu
            try {
                document.getElementById("menu-" + page).classList.add("active");
            } catch (e) {}
    
            document.querySelector(selector).classList.remove("hide");
    
            anime({
                targets: selector,
                easing: "linear",
                opacity: 1,
                duration: 100
            });
    
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
    const all = [".problems", ".reconnecting"];

    anime({
        targets: all,
        easing: "linear",
        opacity: 0,
        duration: 500
    }).finished.then(function () {
        all.forEach((selector) => {
            document.querySelector(selector).classList.add("hide");
        });

        if (all.includes("." + text)) {
            let show = {
                targets: "." + text,
                easing: "linear",
                opacity: 1,
                duration: 500
            };

            document.querySelector("." + text).classList.remove("hide");
            anime(show);
        }
    });
}

function splashScreen(show) {
    anime({
        targets: [".currentpage", "#content"],
        easing: "linear",
        opacity: show ? 0 : 1,
        duration: 500
    });

    anime({
        targets: "#splash",
        easing: "linear",
        opacity: show ? 1 : 0,
        duration: 500
    }).finished.then(function () {
        if (show) {
            document.querySelector("#splash").classList.remove("hide");
            document.querySelector("#content").classList.add("hide");
        } else {
            document.querySelector("#splash").classList.add("hide");
            document.querySelector("#content").classList.remove("hide");
        }
    });
}
