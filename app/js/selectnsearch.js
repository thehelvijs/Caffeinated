const SELECTNSEARCH = {

    create(contents = [], div = document.createElement("div")) {
        let input = document.createElement("input");
        let contentDiv = document.createElement("div");

        div.appendChild(input);
        div.appendChild(contentDiv);
        div.classList.add("sns-container");

        contentDiv.classList.add("sns-contents");
        contentDiv.style.display = "none";

        input.setAttribute("type", "select");
        input.classList.add("sns-input");
        input.addEventListener("focus", () => {
            SELECTNSEARCH.search(div, "");
            SELECTNSEARCH.hideAll();
            contentDiv.style.display = "block";
        });
        document.addEventListener("click", () => {
            if ((getSelection().focusNode.classList == undefined) || !getSelection().focusNode.classList.contains("sns-container")) {
                contentDiv.style.display = "none";
            }
        });
        input.addEventListener("close", () => {
            contentDiv.style.display = "none";
        });
        input.addEventListener("keyup", () => {
            SELECTNSEARCH.search(div);
        });

        this.populate(div, contents);

        return div;
    },

    hideAll() {
        Array.from(document.querySelectorAll(".sns-contents")).forEach((content) => content.style.display = "none");
    },

    search(div, value) {
        let contentDiv = div.querySelector(".sns-contents");
        let input = div.querySelector(".sns-input");

        if (value == null) {
            value = input.value.toLowerCase().trim();
        }

        Array.from(contentDiv.childNodes).forEach((item) => {
            if (item.getAttribute("value").toLowerCase().trim().includes(value)) {
                item.style.display = "block";

                if (!item.getAttribute("displayed")) {
                    item.setAttribute("displayed", true);
                    item.dispatchEvent(new CustomEvent("visible"));
                }
            } else {
                item.style.display = "none";
            }
        });
    },

    populate(div, contents) {
        let contentDiv = div.querySelector(".sns-contents");
        let input = div.querySelector(".sns-input");

        contentDiv.innerHTML = "";

        contents.forEach((section) => {
            let item = document.createElement("a");
            let text;
            let callback;

            if (typeof section == "string") {
                text = section;
            } else {
                text = secion.text;
                callback = section.callback;
            }

            item.innerText = text;
            item.style.display = "block";
            item.setAttribute("value", text);
            item.addEventListener("click", () => {
                input.value = text;
                div.setAttribute("value", text);
                input.dispatchEvent(new CustomEvent("close"));
                div.dispatchEvent(new CustomEvent("change"));
            });

            if (callback) {
                callback(item);
            }

            contentDiv.appendChild(item);
        });
    },

    checkVisible(elm, parent = document.documentElement) {
        let rect = elm.getBoundingClientRect();
        let viewHeight = parent.offsetHeight;

        return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
    }

}