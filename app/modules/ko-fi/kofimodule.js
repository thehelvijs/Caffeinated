
MODULES.moduleClasses["kofi_integration"] = class {

    constructor(id) {
        this.namespace = "kofi_integration";
        this.type = "settings";
        this.id = id;

        this.kinoko = new Kinoko();

        this.kinoko.on("close", () => this.kinoko.connect(this.uuid, "parent"));

        this.kinoko.on("message", (form) => {
            const data = JSON.parse(decodeURIComponent(form.substring(5).replace(/\+/g, " ")));

            console.debug(data);

            if (data.is_public && (data.type === "Donation")) {
                const isTest = data.currency; // Is null on tests

                const id = isTest ? data.kofi_transaction_id : "";
                const currency = isTest ? data.currency : "USD";
                const message = isTest ? data.message : "Test from Ko-fi"

                // TODO subs

                const event = {
                    donations: [
                        {
                            "animated_image": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
                            "currency": currency,
                            "amount": parseFloat(data.amount),
                            "image": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
                        }
                    ],
                    emotes: {},
                    mensions: [],
                    links: [],
                    streamer: CAFFEINATED.userdata,
                    sender: {
                        platform: "KO-FI",
                        image_link: "https://ko-fi.com/favicon.png",
                        followers_count: -1,
                        badges: [],
                        color: "#00B9FE",
                        username: data.from_name,
                        UUID: data.from_name,
                        link: data.url
                    },
                    message: message,
                    id: id,
                    upvotable: false,
                    event_type: "DONATION"
                };

                koi.broadcast("donation", event);
            }
        });

    }

    getDataToStore() {
        return { uuid: this.uuid };
    }

    init() {
        if (this.settings.uuid) {
            this.uuid = this.settings.uuid;
        } else {
            this.uuid = `kofi_signaling:${generateUUID()}:${generateUnsafePassword()}`;
            MODULES.saveToStore(this);
        }

        this.kinoko.connect(this.uuid, "parent");

        this.page.querySelector("[name=url").setAttribute("readonly", "");
        this.page.querySelector("[name=url").value = "https://api.casterlabs.co/v1/kinoko?channel=" + encodeURIComponent(this.uuid);

        const instructions = document.createElement("div");

        instructions.innerHTML = `
            <a onclick="openLink('https:\/\/ko-fi.com/manage/webhooks?src=casterlabs_caffeinated')">Go here</a>, then paste the provided url into the Webhook URL field and hit Update.
            <br />
            <br />
            You can test to see if this worked by hitting Send Test.
        `;

        this.page.firstChild.appendChild(instructions);
    }

    settingsDisplay = {
        url: {
            display: "Webhook URL",
            type: "input"
        }
    };

    defaultSettings = {
        url: ""
    };

};
