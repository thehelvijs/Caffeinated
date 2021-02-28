LANG.absorbLang({
    "meta.language.name": "French",
    "meta.language.name.native": "Français",
    "meta.language.code": "fr-*",

    // UI
    "caffeinated.internal.widgets": "Outils",
    "caffeinated.internal.followers_count_text": (count) => `${count} ${(count == 1 ? "follower" : "followers")}`,
    "caffeinated.internal.subscribers_count_text": (count) => `${count} ${(count == 1 ? "abonné(e)" : "abonnés")}`,

    // Generic
    "generic.font": "Police de caractère",
    "generic.font.size": "Grandeur de Police de caractère (px)",
    "generic.text.color": "Couleur de Texte",
    // TODO "generic.background.color": "Background Color",
    "generic.volume": "Volume",
    "generic.alert.audio": "Audio d'Alerte",
    "generic.alert.image": "Image d'Alerte",
    "generic.audio.file": "Fichier Audio",
    "generic.image.file": "Fichier Image",
    "generic.currency": "Devise",
    "generic.enable_audio": "Activer l'audio personnalisé",
    "generic.use_custom_image": "Utuliser l'image personnalisé",

    // Video Share
    // TODO "caffeinated.videoshare.title": "Video Share",
    // TODO "caffeinated.videoshare.donations_only": "Donations Only",
    // TODO "caffeinated.videoshare.skip": "Skip",

    /* TODO
    // Raid
    "caffeinated.raid_alert.title": "Raid Alert",
    "caffeinated.raid_alert.format.now_raiding": (raider, viewers) => `${raider} just raided with ${viewers} viewers`,

    // Subscription Goal
    "caffeinated.subscription_goal.title": "Subscription Goal",

    // Subscription
    "caffeinated.subscription_alert.title": "Subscription Alert",
    "caffeinated.subscription_alert.format.sub": (name, months, isPlural) => `${name} just subscribed for ${months} month${isPlural ? "s" : ""}`,
    "caffeinated.subscription_alert.format.resub": (name, months, isPlural) => `${name} just resubscribed for ${months} month${isPlural ? "s" : ""}`,
    "caffeinated.subscription_alert.format.subgift": (name, giftee, months, isPlural) => `${name} just gifted ${giftee} a ${months} month${isPlural ? "s" : ""} subscription`,
    "caffeinated.subscription_alert.format.resubgift": (name, giftee, months, isPlural) => `${name} just gifted ${giftee} a ${months} month${isPlural ? "s" : ""} resubscription`,
    "caffeinated.subscription_alert.format.anonsubgift": (giftee, months, isPlural) => `Anonymous just gifted ${giftee} a ${months} month${isPlural ? "s" : ""} subscription`,
    "caffeinated.subscription_alert.format.anonresubgift": (giftee, months, isPlural) => `Anonymous just gifted ${giftee} a ${months} month${isPlural ? "s" : ""} resubscription`,
    */

    // Credits
    "caffeinated.credits.title": "Crédit",

    // Settings
    "caffeinated.settings.title": "Réglages",
    "caffeinated.settings.signout": "Déconnexion",
    "caffeinated.settings.language": "Langue",
    // TODO "caffeinated.settings.view_changelog": "View Changelog",

    // Support Us
    "caffeinated.supporters.title": "Nous Soutenir",

    // Chat Display
    "caffeinated.chatdisplay.title": "Chat",
    "caffeinated.chatdisplay.join_text": (name) => `${name} a rejoint le flux vidéo`,
    "caffeinated.chatdisplay.leave_text": (name) => `${name} quitter le flux vidéo`,
    "caffeinated.chatdisplay.follow_text": (name) => `${name} a commencé à suivre`,
    // TODO "caffeinated.chatdisplay.reward_text": (name, title, image) => `${name} just redeemed ${image}${title}`,

    // Chat
    "caffeinated.chat.title": "Chat",
    "caffeinated.chat.show_donations": "Montre Donations",
    "caffeinated.chat.chat_direction": "Direction",
    "caffeinated.chat.chat_animation": "Animation",
    "caffeinated.chat.text_align": "Alignment de Texte",

    // Donation Goal
    "caffeinated.donation_goal.title": "Objectif de don",
    "caffeinated.donation_goal.current_amount": "Montant actuel",

    // Follower Goal
    "caffeinated.follower_goal.title": "Objectif suiveur",

    // Generic Goal
    "caffeinated.generic_goal.name": "Titre",
    "caffeinated.generic_goal.goal_amount": "Montant cible",
    "caffeinated.generic_goal.text_color": "Couleur de Titre",
    "caffeinated.generic_goal.bar_color": "Couleur de la barre",

    // Donation Alert
    "caffeinated.donation_alert.title": "Alerte de don",
    "caffeinated.donation_alert.text_to_speech_voice": "Voix de synthèse vocale",

    // Follower Alert
    "caffeinated.follower_alert.title": "Alerte Suiveur",
    // TODO "caffeinated.follower_alert.format.followed": (user) => `${user} just followed`,

    // Spotify
    "spotify.integration.title": "Spotify",
    "spotify.integration.login": "Connectez-vous avec Spotify",
    "spotify.integration.logging_in": "Se connecter",
    "spotify.integration.logged_in_as": (name) => `Connecté en tant que ${name}, (Cliquez pour vous déconnecter)`,
    "spotify.integration.announce": "Annoncer la chanson",
    "spotify.integration.enable_song_command": "Activer la commande de chanson",
    "spotify.integration.background_style": "Style de fond",
    "spotify.integration.image_style": "Style d'Image",
    "spotify.integration.now_playing_announcment": (title, artist) => `Lecture en cours: ${title} - ${artist}`,

    // View Counter
    "caffeinated.view_counter.title": "Compteur de Vue",

    // Recent Follow
    "caffeinated.recent_follow.title": "Suivi récent",

    // Donation Ticker
    "caffeinated.donation_ticker.title": "Compteur de dons",

    // Top Donation
    "caffeinated.top_donation.title": "Don le Plus Grand",

    // Recent Donation
    "caffeinated.recent_donation.title": "Don Recent",

    // Recent Subscription
    "caffeinated.recent_subscription.title": "Subscription Recent",

    // Chat Bot
    "caffeinated.chatbot.title": "Robot de Chat",
    "caffeinated.chatbot.enabled": "Activé",
    "caffeinated.chatbot.commands": "Commandes",
    "caffeinated.chatbot.follow_callout": "Notification Suiveur (Laisser vide pour désactiver)",
    "caffeinated.chatbot.donation_callout": "Notification de Don (Laisser vide pour désactiver)",
    "caffeinated.chatbot.default_reply": "Casterlabs est un service gratuit pour des modules de vidéo en streaming!",
    "caffeinated.chatbot.command_type": "Type de Commande",
    "caffeinated.chatbot.trigger": "Déclencheur",
    "caffeinated.chatbot.reply": "Repond",
    // TODO "caffeinated.chatbot.uptime_command.enable": "Enable Uptime Command",
    // TODO "caffeinated.chatbot.uptime_command.format": (time) => `The stream has been up for ${time}`,
    // TODO "caffeinated.chatbot.uptime_command.not_live": "We're off the air",

    // Caffeine Integration
    "caffeine.integration.title": "Caffeine",
    "caffeine.integration.new_thumbnail": "Nouvelle miniature",
    "caffeine.integration.rating_selector": "Évaluation du contenu",
    "caffeine.integration.title_selector": "Titre",
    "caffeine.integration.game_selector": "Jeux selectionner",
    "caffeine.integration.update": "Mettre à jour",

    // Casterlabs Companion
    "caffeinated.companion.title": "Companion Casterlabs",
    "caffeinated.companion.enabled": "Activé",
    "caffeinated.companion.copy": "Copier le lien",
    "caffeinated.companion.reset": "Réinitialiser le lien"

}, "fr-*");
