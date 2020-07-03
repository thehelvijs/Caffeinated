let closebtn = document.getElementById("closebtn");
const path = require("path")

closebtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.closeCurrentWindow();
});
