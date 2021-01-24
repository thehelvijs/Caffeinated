let LANGUAGES = {
    "en-*": {
        "caffeinated.internal.widgets": "Widgets",
        "caffeinated.internal.followers_count_text": (count) => `${count} followers`,

        "caffeinated.credits.title": "Credits",

        "caffeinated.settings.title": "Settings",
        "caffeinated.settings.signout": "Sign out",

        "caffeinated.supporters.title": "Support Us",

        "caffeinated.chatdisplay.title": "Chat",

        "caffeine.integration.title": "Caffeine",
        "caffeine.integration.new_thumbnail": "New thumbnail",
        "caffeine.integration.rating_selector": "Content Rating",
        "caffeine.integration.title_selector": "Title",
        "caffeine.integration.game_selector": "Selected Game",
        "caffeine.integration.update": "Update",

        "caffeinated.companion.title": "Casterlabs Companion",
        "caffeinated.companion.enabled": "Enabled",
        "caffeinated.companion.open": "Open this link on your device",
        "caffeinated.companion.reset": "Reset Link",

    }
};

function absorbLang(newLang) {
    for (const [key, value] of Object.entries(newLang)) {
        if (LANGUAGES[key]) {
            LANGUAGES[key] = Object.assign(LANGUAGES[key], value);
        } else {
            LANGUAGES[key] = value;
        }
    }
}

function getLangKey(lang = navigator.language) {
    for (const code of Object.keys(LANGUAGES)) {
        const regex = RepoUtil.matchToRegex(code);

        if (lang.match(regex)) {
            return code;
        }
    }

    return null;
}

function getSupportedLanguage(langs = navigator.languages) {
    const stored = CAFFEINATED.store.get("language");

    if (stored) {
        const code = getLangKey(stored);

        if (code) {
            return code;
        } // Otherwise, figure it out based on what the OS gives us.
    }

    for (const lang of langs) {
        const code = getLangKey(lang);

        if (code) {
            return code;
        }
    }

    if (CAFFEINATED.store.get("experimental_no_translation_default")) {
        return "";
    } else {
        return "en-*";
    }
}

function translate(parent = document, ...args) {
    const lang = LANGUAGES[getSupportedLanguage()];

    Array.from(parent.querySelectorAll(".translatable")).forEach((element) => {
        const key = element.getAttribute("lang");
        let translated = lang[key];
        let result;

        if (translated === "undefined") {
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
}

function getTranslation(key, ...args) {
    const lang = LANGUAGES[getSupportedLanguage()];

    let translated = lang[key];

    if (translated === "undefined") {
        return key;
    } else {

        if (typeof translated === "function") {
            translated = translated(...args);
        }

        return translated;
    }
}
