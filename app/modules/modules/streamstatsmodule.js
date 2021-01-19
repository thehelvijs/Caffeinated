
MODULES.moduleClasses["casterlabs_stream_stats"] = class {

    constructor(id) {
        this.namespace = "casterlabs_stream_stats";
        this.type = "application";
        this.id = id;

        koi.addEventListener("chat", (event) => {

        });

        koi.addEventListener("donation", (event) => {

        });

        koi.addEventListener("upvote", (event) => {

        });

        koi.addEventListener("follow", (event) => {

        });

        koi.addEventListener("streamstatus", (event) => {

        });

        STREAM_INTEGRATION.addEventListener("join", (event) => {

        });

        STREAM_INTEGRATION.addEventListener("leave", (event) => {

        });

        STREAM_INTEGRATION.addEventListener("viewcount", (count) => {
            // View count, this is different from viewers as it includes anonymous viewers
        });

        STREAM_INTEGRATION.addEventListener("viewers", (viewers) => {
            // A list of viewers
        });
    }

    getDataToStore() {
        return this.settings;
    }

    init() {
        this.settings = MODULES.getStoredValues(this);

        this.page.innerHTML = `
            <span>Test!</span>
        `;

        // TODO (Jake):
        // Always use this.page as the root element (do not use document)
    }

    save() {
        MODULES.saveToStore(this);
    }

    defaultSettings = {} // TODO (Jake): whatever you need

};
