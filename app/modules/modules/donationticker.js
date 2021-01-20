
MODULES.moduleClasses["casterlabs_donation_ticker"] = class {

    constructor(id) {
        this.namespace = "casterlabs_donation_ticker";
        this.type = "overlay settings";
        this.id = id;

    }

    widgetDisplay = [
        {
            name: "Reset",
            icon: "trash",
            async onclick(instance) {
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

        if (this.amount === undefined) {
            this.amount = 0;
        }

        koi.addEventListener("donation", async (event) => {
            if (!event.isTest) {
                for (const donation of event.donations) {
                    this.amount += (await convertCurrency(donation.amount, donation.currency, "USD"));
                }

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

        const amount = await convertAndFormatCurrency(this.amount, "USD", this.settings.currency);

        MODULES.emitIO(this, "event", `
            <span style="font-size: ${this.settings.font_size}px; color: ${this.settings.text_color};">
                ${amount}
            </span>
        `, socket);
    }

    settingsDisplay = {
        font: "font",
        currency: "currency",
        font_size: "number",
        text_color: "color"
    };

    defaultSettings = {
        font: "Poppins",
        currency: "USD",
        font_size: 24,
        text_color: "#FFFFFF"
    };

};
