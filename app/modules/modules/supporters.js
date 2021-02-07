
MODULES.moduleClasses["casterlabs_supporters"] = class {

    constructor(id) {
        this.namespace = "casterlabs_supporters";
        this.displayname = "caffeinated.supporters.title";
        this.type = "application";
        this.id = id;
        this.icon = "star";

    }

    init() {
        this.page.innerHTML = `
            <br />
            <p style="text-align: center;">
                Loving Caffeinated? Feel free to support the project <a style="color: #e94b4b;" onclick="openLink('https://ko-fi.com/casterlabs')">here</a>.
            </p>
            <p style="text-align: center;">
                Looking for a custom made overlay design?<br />Get your own at <a style="color: #ff94db;" onclick="openLink('https://reyana.org')">Reyana.org <img style="height: .85em; vertical-align: middle;" src="https://assets.casterlabs.co/butterfly.png" /></a>
            </p>
            <br />
            <h5 style="text-align: center;">
                ★ Our Supporters ★
            </h5>
            <div style="text-align: center;" id="supporters"></div>
            <br />
            <br />
            <br />
        `;

        setInterval(this.update, 60000); // Every 60s

        this.update();
    }

    update() {
        fetch("https://api.casterlabs.co/v1/caffeinated/supporters").then((response) => response.json()).then((donations) => {
            const div = document.querySelector("#supporters");

            div.innerHTML = "";

            donations.forEach((donation) => {
                const text = document.createElement("pre");

                text.innerHTML = donation;
                text.style = "padding: 0; margin: 0;";

                div.appendChild(text);
            });
        });
    }

};
