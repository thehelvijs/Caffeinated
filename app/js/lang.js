let LANGUAGES = {
    "en-*": {
        "caffeinated.settings.title": "Settings",
        "caffeinated.settings.signout": "Sign out"
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
        let regex = RepoUtil.matchToRegex(code);

        if (lang.match(regex)) {
            return code;
        }
    }

    return null;
}

function getSupportedLanguage(langs = navigator.languages) {
    const stored = CAFFEINATED.store.get("language");

    if (stored != null) {
        let code = getLangKey(stored);

        if (code != null) {
            return code;
        } // Otherwise, figure it out based on what the OS gives us.
    }

    for (const lang of langs) {
        let code = getLangKey(lang);

        if (code != null) {
            return code;
        }
    }

    return "en-*";
}

function translate(parent = document) {
    const lang = LANGUAGES[getSupportedLanguage()];

    Array.from(parent.querySelectorAll(".translatable")).forEach((element) => {
        const key = element.getAttribute("lang");
        const translated = lang[key];

        element.innerText = (translated !== undefined) ? translated : key;
        element.setAttribute("title", (translated !== undefined) ? translated : key);
    });
}