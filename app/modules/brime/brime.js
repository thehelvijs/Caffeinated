const BRIME_UNCATEGORIZED_ID = "606e93525fa50e5780970135";

function searchForBrimeCategory(query) {
    return new Promise((resolve, reject) => {
        fetch(`https://api-staging.brimelive.com/internal/category/search?client_id=${BRIME_CLIENT_ID}&q=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((response) => {
                let categories = {};

                for (const category of response.data.result) {
                    categories[category.name] = category._id;
                }

                resolve(categories);
            })
            .catch(reject)
    });
}

MODULES.uniqueModuleClasses["brime_integration"] = class {

    constructor(id) {
        this.namespace = "brime_integration";
        this.displayname = "Brime";
        this.type = "settings";
        this.id = id;
        this.supportedPlatforms = ["BRIME"];
        this.persist = true;

        this.queryingCategories = false;

        this.categories = {};
    }

    async updateSearchContents() {
        if (this.queryingCategories) {
            setTimeout(() => {
                if (!this.queryingCategories) {
                    this.updateSearchContents();
                }
            }, 500);
        } else {
            this.queryingCategories = true;

            try {
                const query = this.page.querySelector("[name='category'] .sns-input").value;
                this.categories = await searchForBrimeCategory(query);

                const categorySearchElement = this.page.querySelector("[name='category']");

                SELECTNSEARCH.populate(categorySearchElement, Object.keys(this.categories));
            } finally {
                this.queryingCategories = false;
            }
        }
    }

    async sendUpdate() {
        const { authorization, client_id } = await koi.getCredentials();

        const headers = new Headers({
            authorization: authorization,
            client_id: client_id,
            "content-type": "application/json"
        });

        const title = this.page.querySelector("[name='title']").value;
        const vodsEnabled = this.page.querySelector("[name='vods_enabled']").checked;
        const category = this.categories[this.page.querySelector("[name='category'] .sns-input").value] ?? BRIME_UNCATEGORIZED_ID;

        fetch(`https://api-staging.brimelive.com/v1/channel/me`, {
            headers: headers
        })
            .then((response) => response.json())
            .then((channelData) => {
                // TEMP
                const { description } = channelData.data;

                fetch("https://api-staging.brimelive.com/internal/channel/update", {
                    headers: headers,
                    method: "POST",
                    body: JSON.stringify({
                        description: description,
                        vodsEnabled: vodsEnabled,
                        title: title,
                        category: category
                    })
                });

            })
    }

    getDataToStore() {
        return this.settings;
    }

    init() {
        this.page
            .querySelector("[name='category'] .sns-input")
            .addEventListener("keydown", () => {
                this.updateSearchContents();
            })
    }

    onSettingsUpdate() {
        this.updated = true;
    }

    settingsDisplay = {
        title: {
            display: "Stream Title",
            type: "input",
            isLang: false
        },
        category: {
            display: "Category",
            type: "search",
            isLang: false
        },
        vods_enabled: {
            display: "Store past broadcasts",
            type: "checkbox",
            isLang: false
        },
        update: {
            display: "Update",
            type: "button",
            isLang: false
        }
    };

    defaultSettings = {
        title: "LIVE on Brime!",
        category: ["Uncategorized"],
        vods_enabled: true,
        update: () => this.sendUpdate()
    };

};
