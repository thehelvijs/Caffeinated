let LANGUAGES = {};

const LANG = {

    absorbLang(newLang, code) {
        for (const [key, value] of Object.entries(newLang)) {
            if (!LANGUAGES[key]) {
                LANGUAGES[key] = {};
            }

            LANGUAGES[key][code] = value;
        }
    },

    getLangKey(key, language = navigator.language) {
        const lang = LANGUAGES[key];

        if (lang) {
            for (const code of Object.keys(lang)) {
                const regex = RepoUtil.matchToRegex(code);

                if (language.match(regex)) {
                    return code;
                }
            }
        }

        return null;
    },

    getSupportedLanguage(key, languages = navigator.languages) {
        const stored = CAFFEINATED.store.get("language");

        if (stored) {
            const code = this.getLangKey(key, stored);

            if (code) {
                return code;
            } else if (CAFFEINATED.store.get("experimental_no_translation_default")) {
                return "";
            }
            // Otherwise, figure it out based on what the OS gives us.
        }

        for (const lang of languages) {
            const code = this.getLangKey(key, lang);

            if (code) {
                return code;
            }
        }

        if (CAFFEINATED.store.get("experimental_no_translation_default")) {
            return "";
        } else {
            return "en-*";
        }
    },

    translate(parent = document, ...args) {
        Array.from(parent.querySelectorAll(".translatable")).forEach((element) => {
            const key = element.getAttribute("lang");
            const lang = LANGUAGES[key];

            const supported = this.getSupportedLanguage(key);
            let translated = supported ? lang[supported] : key;

            let result;

            if (translated === undefined) {
                result = key;
            } else {
                if (typeof translated === "function") {
                    result = translated(...args);
                } else {
                    result = translated;
                }
            }

            element.innerText = result;
            element.setAttribute("title", result);
        });
    },

    getTranslation(key, ...args) {
        const lang = LANGUAGES[key];

        const supported = this.getSupportedLanguage(key);
        let translated = supported ? lang[supported] : key;

        if (translated === undefined) {
            return key;
        } else {
            if (typeof translated === "function") {
                translated = translated(...args);
            }

            return translated;
        }
    },

    formatSubscription(event) {
        const months = `<span class="meta-months">${event.months}</span>`;

        switch (event.sub_type) {
            case "SUB":
                return this.getTranslation("caffeinated.subscription_alert.format.sub", `<span class="meta-subscriber" style="color: ${event.subscriber.color};">${event.subscriber.displayname}</span>`, months);

            case "RESUB":
                return this.getTranslation("caffeinated.subscription_alert.format.resub", `<span class="meta-subscriber" style="color: ${event.subscriber.color};">${event.subscriber.displayname}</span>`, months);

            case "SUBGIFT":
                return this.getTranslation("caffeinated.subscription_alert.format.subgift", `<span class="meta-subscriber" style="color: ${event.subscriber.color};">${event.subscriber.displayname}</span>`, `<span class="meta-subscriber" style="color: ${event.gift_recipient.color};">${event.gift_recipient.displayname}</span>`, months);

            case "RESUBGIFT":
                return this.getTranslation("caffeinated.subscription_alert.format.resubgift", `<span class="meta-subscriber" style="color: ${event.subscriber.color};">${event.subscriber.displayname}</span>`, `<span class="meta-subscriber" style="color: ${event.gift_recipient.color};">${event.gift_recipient.displayname}</span>`, months);

            case "ANONSUBGIFT":
                return this.getTranslation("caffeinated.subscription_alert.format.anonsubgift", `<span class="meta-subscriber" style="color: ${event.gift_recipient.color};">${event.gift_recipient.displayname}</span>`, months);

            case "ANONRESUBGIFT":
                return this.getTranslation("caffeinated.subscription_alert.format.anonresubgift", `<span class="meta-subscriber" style="color: ${event.gift_recipient.color};">${event.gift_recipient.displayname}</span>`, months);

        }
    }

};
