let LANGUAGES = {
    // UI
    "caffeinated.internal.widgets": {
        "en-*": "Widgets"
    },
    "caffeinated.internal.followers_count_text": {
        "en-*": (count) => `${count} followers`
    },

    // Credits
    "caffeinated.credits.title": {
        "en-*": "Credits"
    },

    // Settings
    "caffeinated.settings.title": {
        "en-*": "Settings"
    },
    "caffeinated.settings.signout": {
        "en-*": "Sign out"
    },

    // Support Us
    "caffeinated.supporters.title": {
        "en-*": "Support Us"
    },

    // Chat Display
    "caffeinated.chatdisplay.title": {
        "en-*": "Chat"
    },
    "caffeinated.chatdisplay.follow_text": {
        "en-*": (username) => `${username} started following.`
    },
    "caffeinated.chatdisplay.join_text": {
        "en-*": (username) => `${username} joined the stream.`
    },
    "caffeinated.chatdisplay.leave_text": {
        "en-*": (username) => `${username} left the stream.`
    },

    // Chat
    "caffeinated.chat.title": {
        "en-*": "Chat"
    },
    "caffeinated.chat.font": {
        "en-*": "Font"
    },
    "caffeinated.chat.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.chat.text_color": {
        "en-*": "Text Color"
    },
    "caffeinated.chat.show_donations": {
        "en-*": "Show Donations"
    },
    "caffeinated.chat.chat_direction": {
        "en-*": "Direction"
    },
    "caffeinated.chat.chat_animation": {
        "en-*": "Animation"
    },
    "caffeinated.chat.text_align": {
        "en-*": "Text Align"
    },

    // Donation Goal
    "caffeinated.donation_goal.title": {
        "en-*": "Donation Goal"
    },
    "caffeinated.donation_goal.name": {
        "en-*": "Title"
    },
    "caffeinated.donation_goal.currency": {
        "en-*": "Currency"
    },
    "caffeinated.donation_goal.current_amount": {
        "en-*": "Current Amount"
    },
    "caffeinated.donation_goal.goal_amount": {
        "en-*": "Target Amount"
    },
    "caffeinated.donation_goal.text_color": {
        "en-*": "Title Color"
    },
    "caffeinated.donation_goal.bar_color": {
        "en-*": "Progress Bar Color"
    },

    // Follower Goal
    "caffeinated.follower_goal.title": {
        "en-*": "Follower Goal"
    },
    "caffeinated.follower_goal.name": {
        "en-*": "Title"
    },
    "caffeinated.follower_goal.currency": {
        "en-*": "Currency"
    },
    "caffeinated.follower_goal.goal_amount": {
        "en-*": "Target Amount"
    },
    "caffeinated.follower_goal.text_color": {
        "en-*": "Title Color"
    },
    "caffeinated.follower_goal.bar_color": {
        "en-*": "Progress Bar Color"
    },

    // Donation Alert
    "caffeinated.donation_alert.title": {
        "en-*": "Donation Alert"
    },
    "caffeinated.donation_alert.font": {
        "en-*": "Font"
    },
    "caffeinated.donation_alert.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.donation_alert.text_color": {
        "en-*": "Text Color"
    },
    "caffeinated.donation_alert.volume": {
        "en-*": "Volume"
    },
    "caffeinated.donation_alert.text_to_speech_voice": {
        "en-*": "TTS Voice"
    },
    "caffeinated.donation_alert.audio": {
        "en-*": "Alert Audio"
    },
    "caffeinated.donation_alert.image": {
        "en-*": "Alert Image"
    },
    "caffeinated.donation_alert.audio_file": {
        "en-*": "Audio File"
    },
    "caffeinated.donation_alert.image_file": {
        "en-*": "Image File"
    },

    // Follower Alert
    "caffeinated.follower_alert.title": {
        "en-*": "Follower Alert"
    },
    "caffeinated.follower_alert.font": {
        "en-*": "Font"
    },
    "caffeinated.follower_alert.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.follower_alert.text_color": {
        "en-*": "Text Color"
    },
    "caffeinated.follower_alert.volume": {
        "en-*": "Volume"
    },
    "caffeinated.follower_alert.enable_audio": {
        "en-*": "Enable Custom Audio"
    },
    "caffeinated.follower_alert.use_custom_image": {
        "en-*": "Use Custom Audio"
    },
    "caffeinated.follower_alert.audio_file": {
        "en-*": "Audio File"
    },
    "caffeinated.follower_alert.image_file": {
        "en-*": "Image File"
    },

    // Spotify
    "spotify.integration.title": {
        "en-*": "Spotify"
    },
    "spotify.integration.login": {
        "en-*": "Login with Spotify"
    },
    "spotify.integration.logging_in": {
        "en-*": "Logging in"
    },
    "spotify.integration.logged_in_as": {
        "en-*": (name) => `Logged in as ${name} (Click to log out)`
    },
    "spotify.integration.announce": {
        "en-*": "Announce Song"
    },
    "spotify.integration.background_style": {
        "en-*": "Background Style"
    },
    "spotify.integration.image_style": {
        "en-*": "Image Style"
    },
    "spotify.integration.now_playing_announcment": {
        "en-*": (title, artist) => `Now playing: ${title} - ${artist}`
    },

    // View Counter
    "caffeinated.view_counter.title": {
        "en-*": "View Counter"
    },
    "caffeinated.view_counter.font": {
        "en-*": "Font"
    },
    "caffeinated.view_counter.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.view_counter.text_color": {
        "en-*": "Text Color"
    },

    // Recent Follow
    "caffeinated.recent_follow.title": {
        "en-*": "Recent Follow"
    },
    "caffeinated.recent_follow.font": {
        "en-*": "Font"
    },
    "caffeinated.recent_follow.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.recent_follow.text_color": {
        "en-*": "Text Color"
    },

    // Donation Ticker
    "caffeinated.donation_ticker.title": {
        "en-*": "Donation Ticker"
    },
    "caffeinated.donation_ticker.font": {
        "en-*": "Font"
    },
    "caffeinated.donation_ticker.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.donation_ticker.currency": {
        "en-*": "Currency"
    },
    "caffeinated.donation_ticker.text_color": {
        "en-*": "Text Color"
    },

    // Top Donation
    "caffeinated.top_donation.title": {
        "en-*": "Top Donation"
    },
    "caffeinated.top_donation.font": {
        "en-*": "Font"
    },
    "caffeinated.top_donation.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.top_donation.currency": {
        "en-*": "Currency"
    },
    "caffeinated.top_donation.text_color": {
        "en-*": "Text Color"
    },

    // Recent Donation
    "caffeinated.recent_donation.title": {
        "en-*": "Recent Donation"
    },
    "caffeinated.recent_donation.font": {
        "en-*": "Font"
    },
    "caffeinated.recent_donation.font_size": {
        "en-*": "Font Size (px)"
    },
    "caffeinated.recent_donation.currency": {
        "en-*": "Currency"
    },
    "caffeinated.recent_donation.text_color": {
        "en-*": "Text Color"
    },

    // Chat Bot
    "caffeinated.chatbot.title": {
        "en-*": "Chat Bot"
    },
    "caffeinated.chatbot.enabled": {
        "en-*": "Enabled"
    },
    "caffeinated.chatbot.commands": {
        "en-*": "Commands"
    },
    "caffeinated.chatbot.follow_callout": {
        "en-*": "Follow Callout (Leave blank to disable)"
    },
    "caffeinated.chatbot.donation_callout": {
        "en-*": "Donation Callout (Leave blank to disable)"
    },
    "caffeinated.chatbot.default_follow_callout": {
        "en-*": "Thanks for the follow!"
    },
    "caffeinated.chatbot.default_donation_callout": {
        "en-*": "Thanks for the support!"
    },
    "caffeinated.chatbot.default_reply": {
        "en-*": "Casterlabs is a free stream widget service!"
    },
    "caffeinated.chatbot.command_type": {
        "en-*": "Command Type"
    },
    "caffeinated.chatbot.trigger": {
        "en-*": "Trigger"
    },
    "caffeinated.chatbot.reply": {
        "en-*": "Reply"
    },

    // Caffeine Inregration
    "caffeine.integration.title": {
        "en-*": "Caffeine"
    },
    "caffeine.integration.new_thumbnail": {
        "en-*": "New thumbnail"
    },
    "caffeine.integration.rating_selector": {
        "en-*": "Content Rating"
    },
    "caffeine.integration.title_selector": {
        "en-*": "Title"
    },
    "caffeine.integration.game_selector": {
        "en-*": "Selected Game"
    },
    "caffeine.integration.update": {
        "en-*": "Update"
    },

    // Casterlabs Companion
    "caffeinated.companion.title": {
        "en-*": "Casterlabs Companion"
    },
    "caffeinated.companion.enabled": {
        "en-*": "Enabled"
    },
    "caffeinated.companion.open": {
        "en-*": "Open this link on your device"
    },
    "caffeinated.companion.reset": {
        "en-*": "Reset Link"
    },

};

const LANG = {

    absorbLang(newLang) {
        for (const [key, value] of Object.entries(newLang)) {
            if (LANGUAGES[key]) {
                LANGUAGES[key] = Object.assign(LANGUAGES[key], value);
            } else {
                LANGUAGES[key] = value;
            }
        }
    },

    getLangKey(key, language = navigator.language) {
        const lang = LANGUAGES[key];

        for (const code of Object.keys(lang)) {
            const regex = RepoUtil.matchToRegex(code);

            if (language.match(regex)) {
                return code;
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
            } // Otherwise, figure it out based on what the OS gives us.
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
            let translated = lang[this.getSupportedLanguage(key)];
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

        let translated = lang[this.getSupportedLanguage(key)];

        if (translated === undefined) {
            return key;
        } else {
            if (typeof translated === "function") {
                translated = translated(...args);
            }

            return translated;
        }
    }

};
