
MODULES.moduleClasses["kofi_integration"] = class {

    constructor(id) {
        this.namespace = "kofi_integration";
        this.displayname = "Ko-fi Integration";
        this.type = "settings";
        this.id = id;

        this.kinoko = new Kinoko();

        this.kinoko.on("close", () => this.kinoko.connect(this.uuid, "parent"));

        this.kinoko.on("message", (form) => {
            const data = JSON.parse(decodeURIComponent(form.substring(5).replace(/\+/g, " ")));

            console.debug(data);

            if (data.is_public && (data.type === "Donation")) {
                const isTest = data.kofi_transaction_id === "1234-1234-1234-1234";

                const id = isTest ? data.kofi_transaction_id : "";

                if (data.is_subscription_payment) {
                    koi.broadcast("subscription", {
                        emotes: {},
                        mensions: [],
                        links: [],
                        streamer: CAFFEINATED.userdata.streamer,
                        subscriber: {
                            platform: "KOFI",
                            image_link: "https://ko-fi.com/favicon.png",
                            followers_count: -1,
                            badges: [],
                            color: "#00B9FE",
                            username: data.from_name.toLowerCase(),
                            displayname: data.from_name,
                            UUID: data.from_name,
                            UPID: `${data.from_name};KOFI`,
                            link: data.url
                        },
                        months: 1,
                        sub_type: data.is_first_subscription_payment ? "SUB" : "RESUB",
                        sub_level: "TIER_1",
                        // message: message,
                        id: id,
                        upvotable: false,
                        event_type: "SUBSCRIPTION"
                    });
                } else {
                    const currency = isTest ? data.currency : "USD";
                    const message = isTest ? data.message : "Test from Ko-fi";
                    const amount = isTest ? 0 : parseFloat(data.amount);

                    koi.broadcast("donation", {
                        donations: [
                            {
                                "animated_image": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
                                "currency": currency,
                                "amount": amount,
                                "image": "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
                                "type": "KOFI_DIRECT"
                            }
                        ],
                        emotes: {},
                        mensions: [],
                        links: [],
                        streamer: CAFFEINATED.userdata.streamer,
                        sender: {
                            platform: "KOFI",
                            image_link: "https://ko-fi.com/favicon.png",
                            followers_count: -1,
                            badges: [],
                            color: "#00B9FE",
                            username: data.from_name.toLowerCase(),
                            displayname: data.from_name,
                            UUID: data.from_name,
                            UPID: `${data.from_name};KOFI`,
                            link: data.url
                        },
                        message: message,
                        id: id,
                        upvotable: false,
                        event_type: "DONATION"
                    });
                }
            }
        });

    }

    getDataToStore() {
        return { uuid: this.uuid };
    }

    init() {
        this.uuid = this.settings.uuid;

        if (!this.uuid) {
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
