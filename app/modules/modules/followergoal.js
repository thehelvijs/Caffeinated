
MODULES.moduleClasses["casterlabs_follower_goal"] = class {

    constructor(id) {
        this.namespace = "casterlabs_follower_goal";
        this.displayname = "caffeinated.follower_goal.title";
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
                putInClipboard("https://caffeinated.casterlabs.co/goal.html?namespace=" + instance.namespace + "&id=" + instance.id);
            }
        }
    ]

    getDataToStore() {
        const data = Object.assign({}, this.settings);

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
        title: {
            display: "caffeinated.generic_goal.name",
            type: "input",
            isLang: true
        },
        goal_amount: {
            display: "caffeinated.generic_goal.goal_amount",
            type: "number",
            isLang: true
        },
        height: {
            display: "generic.height",
            type: "number",
            isLang: true
        },
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
        text_color: {
            display: "caffeinated.generic_goal.text_color",
            type: "color",
            isLang: true
        },
        bar_color: {
            display: "caffeinated.generic_goal.bar_color",
            type: "color",
            isLang: true
        }
    };

    defaultSettings = {
        title: "",
        goal_amount: 10,
        height: 60,
        font: "Roboto",
        font_size: 28,
        text_color: "#FFFFFF",
        bar_color: "#31F8FF"
    };

};
