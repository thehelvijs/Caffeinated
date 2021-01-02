
MODULES.moduleClasses["casterlabs_recent_donation"] = class {

    constructor(id) {
        this.namespace = "casterlabs_recent_donation";
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
        },
        {
            name: "Reset",
            icon: "trash",
            async onclick(instance) {
                instance.username = null;
                instance.amount = 0;

                instance.update();
                MODULES.saveToStore(instance);
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
            let amount = 0;

            for (const donation of event.donations) {
                amount += (await convertCurrency(donation.amount, donation.currency, "USD"));
            }

            this.username = event.sender.username;
            this.amount = amount;

            this.update();
            MODULES.saveToStore(this);
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
