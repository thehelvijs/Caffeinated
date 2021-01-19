
MODULES.moduleClasses["casterlabs_goal"] = class {

    constructor(id) {
        this.namespace = "casterlabs_goal";
        this.type = "overlay settings";
        this.id = id;

        if (this.id.includes("follow")) {
            delete this.settingsDisplay.currency;
        }
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

        if (this.id.includes("follow")) {
            koi.addEventListener("user_update", (event) => {
                this.amount = event.streamer.followers_count;

                this.sendUpdates();
                MODULES.saveToStore(this);
            });
        } else {
            koi.addEventListener("donation", async (event) => {
                for (const donation of event.donations) {
                    this.amount += (await convertCurrency(donation.amount, donation.currency, "USD"));
                }

                this.sendUpdates();
                MODULES.saveToStore(this);
            });
        }
    }

    onSettingsUpdate() {
        this.sendUpdates();
    }

    async sendUpdates(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);

        if (this.id.includes("follow")) {
            MODULES.emitIO(this, "amount", this.amount, socket);
            MODULES.emitIO(this, "display", this.amount, socket);
            MODULES.emitIO(this, "goaldisplay", this.settings.goal_amount, socket);
        } else {
            MODULES.emitIO(this, "amount", (await convertCurrency(this.amount, "USD", this.settings.currency)), socket);
            MODULES.emitIO(this, "display", (await convertAndFormatCurrency(this.amount, "USD", this.settings.currency)), socket);
            MODULES.emitIO(this, "goaldisplay", formatCurrency(this.settings.goal_amount, this.settings.currency), socket);
        }
    }

    settingsDisplay = {
        title: "input",
        currency: "currency",
        goal_amount: "number",
        text_color: "color",
        bar_color: "color"
    };

    defaultSettings = {
        title: "",
        currency: "USD",
        goal_amount: "10",
        text_color: "#FFFFFF",
        bar_color: "#31F8FF"
    };

};
