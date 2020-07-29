
MODULES.moduleClasses["casterlabs_goal"] = class {

    constructor(id) {
        this.namespace = "casterlabs_goal";
        this.type = "overlay settings";
        this.id = id;
    }

    linkDisplay = {
        path: "https://caffeinated.casterlabs.co/goal.html",
        option: {
            name: "Reset",
            onclick(instance) {
                instance.amount = 0;

                MODULES.emitIO(instance, "amount", 0);

                if (instance.id.includes("follow")) {
                    MODULES.emitIO(instance, "display", instance.amount);
                } else {
                    MODULES.emitIO(instance, "display", "$" + (Math.round(instance.amount * 100) / 100).toFixed(2));
                }

                MODULES.saveToStore(instance);
            }
        }
    };

    getDataToStore() {
        let data = Object.assign({}, this.settings);

        data.amount = this.amount;

        return data;
    }

    onConnection(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);
        MODULES.emitIO(this, "amount", this.amount, socket);

        if (this.id.includes("follow")) {
            MODULES.emitIO(this, "goaldisplay", this.settings.goal_amount, socket);
            MODULES.emitIO(this, "display", this.amount, socket);
        } else {
            MODULES.emitIO(this, "goaldisplay", "$" + (Math.round(this.settings.goal_amount * 100) / 100).toFixed(2), socket);
            MODULES.emitIO(this, "display", "$" + (Math.round(this.amount * 100) / 100).toFixed(2), socket);
        }
    }

    init() {
        const instance = this;

        this.amount = this.settings.amount;

        if (!this.amount) this.amount = 0;

        if (this.id.includes("userupdate")) {
            koi.addEventListener("follow", (event) => {
                instance.amount = e.streamer.follower_count;

                MODULES.emitIO(this, "amount", instance.amount);
                MODULES.emitIO(this, "display", instance.amount);
                MODULES.saveToStore(instance);
            });
        } else {
            koi.addEventListener("donation", (event) => {
                instance.amount += event.usd_equivalent;

                MODULES.emitIO(this, "amount", instance.amount);
                MODULES.emitIO(this, "display", "$" + (Math.round(instance.amount * 100) / 100).toFixed(2));
                MODULES.saveToStore(instance);
            });
        }
    }

    async onSettingsUpdate() {
        MODULES.emitIO(this, "amount", this.amount);
        MODULES.emitIO(this, "config", this.settings);

        if (this.id.includes("follow")) {
            MODULES.emitIO(this, "goaldisplay", this.settings.goal_amount);
        } else {
            MODULES.emitIO(this, "goaldisplay", "$" + (Math.round(this.settings.goal_amount * 100) / 100).toFixed(2));
        }
    }

    settingsDisplay = {
        title: "input",
        text_color: "color",
        bar_color: "color",
        goal_amount: "10"
    };

    defaultSettings = {
        title: "",
        text_color: "#FFFFFF",
        bar_color: "#31F8FF",
        goal_amount: "10"
    };

};
