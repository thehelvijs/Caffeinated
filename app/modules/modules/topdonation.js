
MODULES.moduleClasses["casterlabs_top_donation"] = class {

    constructor(id) {
        this.namespace = "casterlabs_top_donation";
        this.displayname = "caffeinated.top_donation.title";
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
        const data = Object.assign({}, this.settings);

        data.amount = this.amount;
        data.username = this.username;

        return data;
    }

    onConnection(socket) {
        this.update(socket);
    }

    init() {
        this.amount = this.settings.amount;
        this.username = this.settings.username;

        if (this.amount === undefined) {
            this.amount = 0;
        }

        koi.addEventListener("donation", async (event) => {
            if (!event.isTest) {
                let amount = 0;

                for (const donation of event.donations) {
                    amount += (await convertCurrency(donation.amount, donation.currency, "USD"));
                }

                if (amount >= this.amount) {
                    this.username = event.sender.displayname;
                    this.amount = amount;

                    MODULES.saveToStore(this);
                    this.update();
                }
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
            display: "generic.font",
            type: "font",
            isLang: true
        },
        font_size: {
            display: "generic.font.size",
            type: "number",
            isLang: true
        },
        currency: {
            display: "generic.currency",
            type: "currency",
            isLang: true
        },
        text_color: {
            display: "generic.text.color",
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
