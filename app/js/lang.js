let LANGUAGES = {
    "en-*": {
        // UI
        "caffeinated.internal.widgets": "Widgets",
        "caffeinated.internal.followers_count_text": (count) => `${count} followers`,

        // Credits
        "caffeinated.credits.title": "Credits",

        // Settings
        "caffeinated.settings.title": "Settings",
        "caffeinated.settings.signout": "Sign out",

        // Support Us
        "caffeinated.supporters.title": "Support Us",

        // Chat Display
        "caffeinated.chatdisplay.title": "Chat",

        // Chat
        "caffeinated.chat.title": "Chat",
        "caffeinated.chat.font": "Font",
        "caffeinated.chat.font_size": "Font Size (px)",
        "caffeinated.chat.text_color": "Text Color",
        "caffeinated.chat.show_donations": "Show Donations",
        "caffeinated.chat.chat_direction": "Direction",
        "caffeinated.chat.chat_animation": "Animation",
        "caffeinated.chat.text_align": "Text Align",

        // Donation Goal
        "caffeinated.donation_goal.title": "Donation Goal",
        "caffeinated.donation_goal.name": "Title",
        "caffeinated.donation_goal.currency": "Currency",
        "caffeinated.donation_goal.current_amount": "Current Amount",
        "caffeinated.donation_goal.goal_amount": "Target Amount",
        "caffeinated.donation_goal.text_color": "Title Color",
        "caffeinated.donation_goal.bar_color": "Progress Bar Color",

        // Follower Goal
        "caffeinated.follower_goal.title": "Follower Goal",
        "caffeinated.follower_goal.name": "Title",
        "caffeinated.follower_goal.currency": "Currency",
        "caffeinated.follower_goal.text_color": "Title Color",
        "caffeinated.follower_goal.bar_color": "Progress Bar Color",

        // Donation Alert
        "caffeinated.donation_alert.title": "Donation Alert",
        "caffeinated.donation_alert.font": "Font",
        "caffeinated.donation_alert.font_size": "Font Size (px)",
        "caffeinated.donation_alert.text_color": "Text Color",
        "caffeinated.donation_alert.volume": "Volume",
        "caffeinated.donation_alert.text_to_speech_voice": "TTS Voice",
        "caffeinated.donation_alert.audio": "Alert Audio",
        "caffeinated.donation_alert.image": "Alert Image",
        "caffeinated.donation_alert.audio_file": "Audio File",
        "caffeinated.donation_alert.image_file": "Image File",

        // Follower Alert
        "caffeinated.follower_alert.title": "Follower Alert",
        "caffeinated.follower_alert.font": "Font",
        "caffeinated.follower_alert.font_size": "Font Size (px)",
        "caffeinated.follower_alert.text_color": "Text Color",
        "caffeinated.follower_alert.volume": "Volume",
        "caffeinated.follower_alert.enable_audio": "Enable Custom Audio",
        "caffeinated.follower_alert.use_custom_image": "Use Custom Audio",
        "caffeinated.follower_alert.audio_file": "Audio File",
        "caffeinated.follower_alert.image_file": "Image File",

        // Spotify
        "spotify.integration.title": "Spotify",
        "spotify.integration.login": "Login with Spotify",
        "spotify.integration.logging_in": "Logging in",
        "spotify.integration.logged_in_as": (name) => `Logged in as ${name} (Click to log out)`,
        "spotify.integration.announce": "Announce Song",
        "spotify.integration.background_style": "Background Style",
        "spotify.integration.image_style": "Image Style",
        "spotify.integration.now_playing_announcment": (title, artist) => `Now playing: ${title} - ${artist}`,

        // View Counter
        "caffeinated.view_counter.title": "View Counter",
        "caffeinated.view_counter.font": "Font",
        "caffeinated.view_counter.font_size": "Font Size (px)",
        "caffeinated.view_counter.text_color": "Text Color",

        // Recent Follow
        "caffeinated.recent_follow.title": "Recent Follow",
        "caffeinated.recent_follow.font": "Font",
        "caffeinated.recent_follow.font_size": "Font Size (px)",
        "caffeinated.recent_follow.text_color": "Text Color",

        // Donation Ticker
        "caffeinated.donation_ticker.title": "Donation Ticker",
        "caffeinated.donation_ticker.font": "Font",
        "caffeinated.donation_ticker.font_size": "Font Size (px)",
        "caffeinated.donation_ticker.currency": "Currency",
        "caffeinated.donation_ticker.text_color": "Text Color",

        // Top Donation
        "caffeinated.top_donation.title": "Top Donation",
        "caffeinated.top_donation.font": "Font",
        "caffeinated.top_donation.font_size": "Font Size (px)",
        "caffeinated.top_donation.currency": "Currency",
        "caffeinated.top_donation.text_color": "Text Color",

        // Recent Donation
        "caffeinated.recent_donation.title": "Recent Donation",
        "caffeinated.recent_donation.font": "Font",
        "caffeinated.recent_donation.font_size": "Font Size (px)",
        "caffeinated.recent_donation.currency": "Currency",
        "caffeinated.recent_donation.text_color": "Text Color",

        // Chat Bot
        "caffeinated.chatbot.title": "Chat Bot",
        "caffeinated.chatbot.enabled": "Enabled",
        "caffeinated.chatbot.commands": "Commands",
        "caffeinated.chatbot.follow_callout": "Follow Callout (Leave blank to disable)",
        "caffeinated.chatbot.donation_callout": "Donation Callout (Leave blank to disable)",
        "caffeinated.chatbot.default_follow_callout": "Thanks for the follow!",
        "caffeinated.chatbot.default_donation_callout": "Thanks for the support!",
        "caffeinated.chatbot.default_reply": "Casterlabs is a free stream widget service!",
        "caffeinated.chatbot.command_type": "Command Type",
        "caffeinated.chatbot.trigger": "Trigger",
        "caffeinated.chatbot.reply": "Reply",

        // Caffeine Inregration
        "caffeine.integration.title": "Caffeine",
        "caffeine.integration.new_thumbnail": "New thumbnail",
        "caffeine.integration.rating_selector": "Content Rating",
        "caffeine.integration.title_selector": "Title",
        "caffeine.integration.game_selector": "Selected Game",
        "caffeine.integration.update": "Update",

        // Casterlabs Companion
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
}

function getTranslation(key, ...args) {
    const lang = LANGUAGES[getSupportedLanguage()];

    let translated = lang[key];

    if (translated === undefined) {
        return key;
    } else {
        if (typeof translated === "function") {
            translated = translated(...args);
        }

        return translated;
    }
}
