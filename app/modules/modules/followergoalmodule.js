
MODULES.moduleClasses["casterlabs_follower_goal"] = class {

    constructor(id) {
        this.namespace = "casterlabs_follower_goal";
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

        koi.addEventListener("user_update", (event) => {
            this.amount = event.streamer.followers_count;

            this.sendUpdates();
            MODULES.saveToStore(this);
        });
    }

    onSettingsUpdate() {
        this.sendUpdates();
    }

    async sendUpdates(socket) {
        MODULES.emitIO(this, "config", this.settings, socket);

        MODULES.emitIO(this, "amount", this.amount, socket);
        MODULES.emitIO(this, "display", this.amount, socket);
        MODULES.emitIO(this, "goaldisplay", this.settings.goal_amount, socket);
    }

    settingsDisplay = {
        title: "input",
        goal_amount: "number",
        text_color: "color",
        bar_color: "color"
    };

    defaultSettings = {
        title: "",
        goal_amount: "10",
        text_color: "#FFFFFF",
        bar_color: "#31F8FF"
    };

};
