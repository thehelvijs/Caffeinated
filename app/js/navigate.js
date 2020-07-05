
function navigate(page) {
    Array.from(document.querySelectorAll(".page")).forEach((e) => {
        e.classList.add("hide");
        e.classList.remove("navigated");
    });

    let element = document.querySelector("[page='" + page + "']");

    element.classList.remove("hide");
    element.classList.add("navigated");
}
