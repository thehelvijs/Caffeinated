
MODULES.moduleClasses["casterlabs_recent_donation"] = class {

    constructor(id) {
        this.namespace = "casterlabs_recent_donation";
        this.displayname = "caffeinated.recent_donation.title";
        this.type = "overlay settings";
        this.id = id;

    }

    widgetDisplay = [
        {
            name: "Reset",
            icon: "trash",
            async onclick(instance) {
                instance.username = null;
                instance.amount = 0;

                instance.update();
                MODULES.saveToStore(instance);
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/display.html?namespace=" + instance.namespace + "&id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        return Object.assign({
            username: this.username,
            amount: this.amount
        }, this.settings);
    }

    onConnection(socket) {
        this.update(socket);
    }

    init() {
        this.amount = this.settings.amount;
        this.username = this.settings.username;

        koi.addEventListener("donation", async (event) => {
            if (!event.isTest) {
                let amount = 0;

                for (const donation of event.donations) {
                    amount += (await convertCurrency(donation.amount, donation.currency, "USD"));
                }

                this.username = event.sender.username;
                this.amount = amount;

                this.update();
                MODULES.saveToStore(this);
            }
        });
    }

    async onSettingsUpdate() {
        this.update();
    }

    async update(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);

        if (this.username) {
            const amount = await convertAndFormatCurrency(this.amount, "USD", this.settings.currency);

            MODULES.emitIO(this, "event", `
                <span style="font-size: ${this.settings.font_size}px; color: ${this.settings.text_color};">
                    ${this.username}&nbsp;${amount}
                </span>
            `, socket);
        } else {
            MODULES.emitIO(this, "event", "", socket);
        }
    }

    settingsDisplay = {
        font: {
            display: "caffeinated.recent_donation.font",
            type: "font",
            isLang: true
        },
        font_size: {
            display: "caffeinated.recent_donation.font_size",
            type: "number",
            isLang: true
        },
        currency: {
            display: "caffeinated.recent_donation.currency",
            type: "currency",
            isLang: true
        },
        text_color: {
            display: "caffeinated.recent_donation.text_color",
            type: "color",
            isLang: true
        }
    };

    defaultSettings = {
        font: "Poppins",
        currency: "USD",
        font_size: 24,
        text_color: "#FFFFFF"
    };

};
