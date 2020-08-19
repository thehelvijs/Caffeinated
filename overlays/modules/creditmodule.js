
MODULES.moduleClasses["casterlabs_credits"] = class {

    constructor(id) {
        this.namespace = "casterlabs_credits";
        this.type = "application";
        this.id = id;
        this.icon = "star";
        this.displayname = "Support Us";
    }

    init() {
        this.page.innerHTML = `
            <p>
                Loving Caffeinated?
                <br />
                Feel free to support the project
                <a onclick="openLink('https://paypal.me/casterlabs')">
                    here.
                </a>
                <br />
                <br />
                Supporters above $10 will be listed here, thank you ♥
            </p>
            <br />
            <div id="supporters"></div>
            <div style="position: absolute; bottom: 0;">
                <span>
                    Icons from 
                    <a onclick="openLink('https://ionicons.com/')">
                        <ion-icon name="logo-ionic" title="Ionicons"></ion-icon>
                    </a>
                </span>
            </div>
        `;

        setInterval(this.update, 15000); // Every 15s

        this.update();
    }

    update() {
        fetch("https://caffeinated.casterlabs.co/supporters.json").then((response) => response.json()).then((donations) => {
            let div = document.querySelector("#supporters");

            div.innerHTML = "";

            donations.forEach((donation) => {
                let span = document.createElement("span");

                span.innerText = donation;

                div.appendChild(span);
                div.appendChild(document.createElement("br"));
            });
        });
    }

};
