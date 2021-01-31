
MODULES.moduleClasses["casterlabs_donation_ticker"] = class {

    constructor(id) {
        this.namespace = "casterlabs_donation_ticker";
        this.displayname = "caffeinated.donation_ticker.title";
        this.type = "overlay settings";
        this.id = id;

    }

    widgetDisplay = [
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
            amount: this.amount
        }, this.settings);
    }

    onConnection(socket) {
        this.update(socket);
    }

    init() {
        this.amount = this.settings.amount;

        if (this.amount === undefined) {
            this.amount = 0;
        }

        koi.addEventListener("donation", async (event) => {
            if (!event.isTest) {
                for (const donation of event.donations) {
                    this.amount += (await convertCurrency(donation.amount, donation.currency, "USD"));
                }

                MODULES.saveToStore(this);
                this.update();
            }
        });
    }

    async onSettingsUpdate() {
        this.update();
    }

    async update(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);

        const amount = await convertAndFormatCurrency(this.amount, "USD", this.settings.currency);

        MODULES.emitIO(this, "event", `
            <span style="font-size: ${this.settings.font_size}px; color: ${this.settings.text_color};">
                ${amount}
            </span>
        `, socket);
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
