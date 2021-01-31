let LANGUAGES = {
    // UI
    "caffeinated.internal.widgets": {
        "en-*": "Widgets",
        "fr-*": "Outils"
    },
    "caffeinated.internal.followers_count_text": {
        "en-*": (count) => `${count} followers`,
        "fr-*": (count) => `${count} suiveures`
    },

    // Generic
    "generic.font": {
        "en-*": "Font",
        "fr-*": "Police de caractère"
    },
    "generic.font.size": {
        "en-*": "Font Size (px)",
        "fr-*": "Grandeur de Police de caractère (px)"
    },
    "generic.text.color": {
        "en-*": "Text Color",
        "fr-*": "Couleur de Texte"
    },
    "generic.volume": {
        "en-*": "Volume",
        "fr-*": "Volume"
    },
    "generic.alert.audio": {
        "en-*": "Alert Audio",
        "fr-*": "Audio d'Alerte"
    },
    "generic.alert.image": {
        "en-*": "Alert Image",
        "fr-*": "Image d'Alerte"
    },
    "generic.audio.file": {
        "en-*": "Audio File",
        "fr-*": "Fichier Audio"
    },
    "generic.image.file": {
        "en-*": "Image File",
        "fr-*": "Fichier Image"
    },
    "generic.currency": {
        "en-*": "Currency",
        "fr-*": "Devise"
    },

    // Credits
    "caffeinated.credits.title": {
        "en-*": "Credits",
        "fr-*": "Crédit"
    },

    // Settings
    "caffeinated.settings.title": {
        "en-*": "Settings",
        "fr-*": "Réglages"
    },
    "caffeinated.settings.signout": {
        "en-*": "Sign out",
        "fr-*": "Déconnexion"
    },
    "caffeinated.settings.language": {
        "en-*": "Language",
        "fr-*": "Langue"
    },

    // Support Us
    "caffeinated.supporters.title": {
        "en-*": "Support Us",
        "fr-*": "Nous Soutenir"
    },

    // Chat Display
    "caffeinated.chatdisplay.title": {
        "en-*": "Chat",
        "fr-*": "Chat"
    },
    "caffeinated.chatdisplay.follow_text": {
        "en-*": (username) => `${username} started following.`,
        "fr-*": (username) => `${username} a commencé à suivre.`
    },
    "caffeinated.chatdisplay.join_text": {
        "en-*": (username) => `${username} joined the stream.`,
        "fr-*": (username) => `${username} a rejoint le flux vidéo.`
    },
    "caffeinated.chatdisplay.leave_text": {
        "en-*": (username) => `${username} left the stream.`,
        "fr-*": (username) => `${username} quitter le flux vidéo.`
    },

    // Chat
    "caffeinated.chat.title": {
        "en-*": "Chat",
        "fr-*": "Chat"
    },
    "caffeinated.chat.show_donations": {
        "en-*": "Show Donations",
        "fr-*": "Montre Donations"
    },
    "caffeinated.chat.chat_direction": {
        "en-*": "Direction",
        "fr-*": "Direction"
    },
    "caffeinated.chat.chat_animation": {
        "en-*": "Animation",
        "fr-*": "Animation"
    },
    "caffeinated.chat.text_align": {
        "en-*": "Text Align",
        "fr-*": "Alignment de Texte"
    },

    // Donation Goal
    "caffeinated.donation_goal.title": {
        "en-*": "Donation Goal",
        "fr-*": "Objectif de don"
    },
    "caffeinated.donation_goal.name": {
        "en-*": "Title",
        "fr-*": "Titre"
    },
    "caffeinated.donation_goal.current_amount": {
        "en-*": "Current Amount",
        "fr-*": "Montant actuel"
    },
    "caffeinated.donation_goal.goal_amount": {
        "en-*": "Target Amount",
        "fr-*": "Montant cible"
    },
    "caffeinated.donation_goal.text_color": {
        "en-*": "Title Color",
        "fr-*": "Couleur de Titre"
    },
    "caffeinated.donation_goal.bar_color": {
        "en-*": "Progress Bar Color",
        "fr-*": "Couleur de la barre"
    },

    // Follower Goal
    "caffeinated.follower_goal.title": {
        "en-*": "Follower Goal",
        "fr-*": "Objectif suiveur"
    },
    "caffeinated.follower_goal.name": {
        "en-*": "Title",
        "fr-*": "Titre"
    },
    "caffeinated.follower_goal.goal_amount": {
        "en-*": "Target Amount",
        "fr-*": "Montant cible"
    },
    "caffeinated.follower_goal.text_color": {
        "en-*": "Title Color",
        "fr-*": "Couleur de Titre"
    },
    "caffeinated.follower_goal.bar_color": {
        "en-*": "Progress Bar Color",
        "fr-*": "Couleur de la barre"
    },

    // Donation Alert
    "caffeinated.donation_alert.title": {
        "en-*": "Donation Alert",
        "fr-*": "Alerte de don"
    },
    "caffeinated.donation_alert.text_to_speech_voice": {
        "en-*": "TTS Voice",
        "fr-*": "Voix de synthèse vocale"
    },

    // Follower Alert
    "caffeinated.follower_alert.title": {
        "en-*": "Follower Alert",
        "fr-*": "Alerte Suiveur"
    },
    "caffeinated.follower_alert.enable_audio": {
        "en-*": "Enable Custom Audio",
        "fr-*": "Activer l'audio personnalisé"
    },
    "caffeinated.follower_alert.use_custom_image": {
        "en-*": "Use Custom Image",
        "fr-*": "Utuliser l'image personnalisé"
    },

    // Spotify
    "spotify.integration.title": {
        "en-*": "Spotify",
        "fr-*": "Spotify"
    },
    "spotify.integration.login": {
        "en-*": "Login with Spotify",
        "fr-*": "Connectez-vous avec Spotify"
    },
    "spotify.integration.logging_in": {
        "en-*": "Logging in",
        "fr-*": "Se connecter"
    },
    "spotify.integration.logged_in_as": {
        "en-*": (name) => `Logged in as ${name} (Click to log out)`,
        "fr-*": (name) => `Connecté en tant que ${name}, (Cliquez pour vous déconnecter)`
    },
    "spotify.integration.announce": {
        "en-*": "Announce Song",
        "fr-*": "Annoncer la chanson"
    },
    "spotify.integration.background_style": {
        "en-*": "Background Style",
        "fr-*": "Style de fond"
    },
    "spotify.integration.image_style": {
        "en-*": "Image Style",
        "fr-*": "Style d'Image"
    },
    "spotify.integration.now_playing_announcment": {
        "en-*": (title, artist) => `Now playing: ${title} - ${artist}`,
        "fr-*": (title, artist) => `Lecture en cours: ${title} - ${artist}`
    },

    // View Counter
    "caffeinated.view_counter.title": {
        "en-*": "View Counter",
        "fr-*": "Compteur de Vue"
    },

    // Recent Follow
    "caffeinated.recent_follow.title": {
        "en-*": "Recent Follow",
        "fr-*": "Suivi récent"
    },

    // Donation Ticker
    "caffeinated.donation_ticker.title": {
        "en-*": "Donation Ticker",
        "fr-*": "Compteur de dons"
    },

    // Top Donation
    "caffeinated.top_donation.title": {
        "en-*": "Top Donation",
        "fr-*": "Don le Plus Grand"
    },

    // Recent Donation
    "caffeinated.recent_donation.title": {
        "en-*": "Recent Donation",
        "fr-*": "Don Recent"
    },

    // Chat Bot
    "caffeinated.chatbot.title": {
        "en-*": "Chat Bot",
        "fr-*": "Robot de Chat"
    },
    "caffeinated.chatbot.enabled": {
        "en-*": "Enabled",
        "fr-*": "Activé"
    },
    "caffeinated.chatbot.commands": {
        "en-*": "Commands",
        "fr-*": "Commandes"
    },
    "caffeinated.chatbot.follow_callout": {
        "en-*": "Follow Callout (Leave blank to disable)",
        "fr-*": "Notification Suiveur (Laisser vide pour désactiver)"
    },
    "caffeinated.chatbot.donation_callout": {
        "en-*": "Donation Callout (Leave blank to disable)",
        "fr-*": "Notification de Don (Laisser vide pour désactiver)"
    },
    "caffeinated.chatbot.default_follow_callout": {
        "en-*": "Thanks for the follow!",
        "fr-*": "Merci pour me suivre!"
    },
    "caffeinated.chatbot.default_donation_callout": {
        "en-*": "Thanks for the support!",
        "fr-*": "Merci pour le support!"
    },
    "caffeinated.chatbot.default_reply": {
        "en-*": "Casterlabs is a free stream widget service!",
        "fr-*": "Casterlabs est un service gratuit pour des modules de vidéo en streaming!"
    },
    "caffeinated.chatbot.command_type": {
        "en-*": "Command Type",
        "fr-*": "Type de Commande"
    },
    "caffeinated.chatbot.trigger": {
        "en-*": "Trigger",
        "fr-*": "Déclencheur"
    },
    "caffeinated.chatbot.reply": {
        "en-*": "Reply",
        "fr-*": "Repond"
    },

    // Caffeine Inregration
    "caffeine.integration.title": {
        "en-*": "Caffeine",
        "fr-*": "Caffeine"
    },
    "caffeine.integration.new_thumbnail": {
        "en-*": "New thumbnail",
        "fr-*": "Nouvelle miniature"
    },
    "caffeine.integration.rating_selector": {
        "en-*": "Content Rating",
        "fr-*": "Évaluation du contenu"
    },
    "caffeine.integration.title_selector": {
        "en-*": "Title",
        "fr-*": "Titre"
    },
    "caffeine.integration.game_selector": {
        "en-*": "Selected Game",
        "fr-*": "Jeux selectionner"
    },
    "caffeine.integration.update": {
        "en-*": "Update",
        "fr-*": "Mettre à jour"
    },

    // Casterlabs Companion
    "caffeinated.companion.title": {
        "en-*": "Casterlabs Companion",
        "fr-*": "Companion Casterlabs"
    },
    "caffeinated.companion.enabled": {
        "en-*": "Enabled",
        "fr-*": "Activé"
    },
    "caffeinated.companion.open": {
        "en-*": "Open this link on your device",
        "fr-*": "Ouvrez ce lien sur votre appareil"
    },
    "caffeinated.companion.reset": {
        "en-*": "Reset Link",
        "fr-*": "Réinitialiser le lien"
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
    }

};
