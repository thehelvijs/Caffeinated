import NodeStatsProvider from "./node-stats-provider.mjs";

MODULES.uniqueModuleClasses["casterlabs_stats"] = class {

    constructor(id) {
        this.namespace = "casterlabs_stats";
        this.displayname = "caffeinated.stats.title";
        this.type = "application";
        this.id = id;
        this.icon = "stats-chart";
        this.persist = true;
        this.pageSrc = `file://${__dirname}/modules/modules/stats/stats.html`;
    }

    init() {
        this.pageFrame = this.page.querySelector("iframe");

        this.onUserUpdate(CAFFEINATED.userdata);
        koi.addEventListener("user_update", (event) => this.onUserUpdate(event));
    }

    onUserUpdate(event) {
        if (event) {
            if (!this.lastUserUpdate || (!this.lastUserUpdate.streamer.UPID != event.streamer.UPID)) {
                this.lastUserUpdate = event;

                this.statsProvider?.shutDown();

                this.statsProvider = new NodeStatsProvider(event.streamer.id, event.streamer.platform);
                window.test = this.statsProvider;
            }
        }
    }

};
