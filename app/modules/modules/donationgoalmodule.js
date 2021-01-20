
MODULES.moduleClasses["casterlabs_donation_goal"] = class {

    constructor(id) {
        this.namespace = "casterlabs_donation_goal";
        this.type = "overlay settings";
        this.id = id;
    }

    widgetDisplay = [
        {
            name: "Reset",
            icon: "trash",
            async onclick(instance) {
                instance.amount = 0;

                instance.sendUpdates();
                MODULES.saveToStore(instance);
            }
        },
        {
            name: "Copy",
            icon: "copy",
            onclick(instance) {
                putInClipboard("https://caffeinated.casterlabs.co/goal.html?id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        let data = Object.assign({}, this.settings);

        data.amount = this.amount;

        return data;
    }

    async onConnection(socket) {
        this.sendUpdates(socket);
    }

    init() {
        this.amount = this.settings.amount;

        if (!this.amount) this.amount = 0;

        koi.addEventListener("donation", async (event) => {
            if (!event.isTest) {
                for (const donation of event.donations) {
                    this.amount += (await convertCurrency(donation.amount, donation.currency, "USD"));
                }

                this.sendUpdates();
                MODULES.saveToStore(this);
            }
        });
    }

    async onSettingsUpdate() {
        const current = parseFloat(this.page.querySelector("[name=current_amount]").value);

        this.amount = (await convertCurrency(current, this.settings.currency, "USD"));

        this.sendUpdates();
    }

    async sendUpdates(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);

        const convertedAmount = (await convertCurrency(this.amount, "USD", this.settings.currency));

        this.page.querySelector("[name=current_amount]").value = convertedAmount;

        MODULES.emitIO(this, "amount", convertedAmount, socket);
        MODULES.emitIO(this, "display", (await convertAndFormatCurrency(this.amount, "USD", this.settings.currency)), socket);
        MODULES.emitIO(this, "goaldisplay", formatCurrency(this.settings.goal_amount, this.settings.currency), socket);
    }

    settingsDisplay = {
        title: "input",
        currency: "currency",
        current_amount: "number",
        goal_amount: "number",
        text_color: "color",
        bar_color: "color"
    };

    defaultSettings = {
        title: "",
        currency: "USD",
        current_amount: "10",
        goal_amount: "10",
        text_color: "#FFFFFF",
        bar_color: "#31F8FF"
    };

};