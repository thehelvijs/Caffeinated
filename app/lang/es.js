LANG.absorbLang({
    "meta.language.name": "Spanish",
    "meta.language.name.native": "Español",
    "meta.language.code": "es-*",

    // UI
    "caffeinated.internal.widgets": "Widgets",
    "caffeinated.internal.followers_count_text": (count) => `${count} ${(count == 1 ? "seguidor(a)" : "seguidores")}`,
    "caffeinated.internal.subscribers_count_text": (count) => `${count} ${(count == 1 ? "abonado" : "suscriptores")}`,

    // Generic
    "generic.enabled": "Activado",
    "generic.font": "Fuente",
    "generic.font.size": "Tamaño de Fuente (px)",
    "generic.text.color": "Color del Texto",
    // TODO "generic.background.color": "Background Color",
    "generic.volume": "Volumen",
    "generic.alert.audio": "Audio de Alerta",
    "generic.alert.image": "Imagen de Alerta",
    "generic.audio.file": "Archivo de Audio",
    "generic.image.file": "Archivo de Imagen",
    "generic.currency": "Moneda",
    "generic.enable_audio": "Activar audio personalizado",
    "generic.use_custom_image": "Utilizar imagen personalizada",
    // TODO "generic.height": "Height (px)",
    // TODO "generic.height": "Width (px)",

    // Video Share
    // TODO "caffeinated.videoshare.title": "Video Share",
    // TODO "caffeinated.videoshare.donations_only": "Donations Only",
    // TODO "caffeinated.videoshare.skip": "Skip",
    // TODO "caffeinated.videoshare.pause": "Play/Pause",
    // TODO "caffeinated.videoshare.player_only": "Player Only (No frame)",

    // Raid
    "caffeinated.raid_alert.title": "Alerta de Incursión",
    "caffeinated.raid_alert.format.now_raiding": (raider, viewers) => `${raider} acaba de llegar con ${viewers} espectadores`,

    // Subscription Goal
    "caffeinated.subscription_goal.title": "Meta de Suscripciónes",

    // Subscription
    "caffeinated.subscription_alert.title": "Alerta de Suscripción",
    "caffeinated.subscription_alert.format.sub": (name, months) => `${name} acaba de suscribir por ${months} meses`,
    "caffeinated.subscription_alert.format.resub": (name, months) => `${name} acab de resubscribir por ${months} meses`,
    "caffeinated.subscription_alert.format.subgift": (name, giftee, months) => `${name} le acaba de regalar a ${giftee} una suscripción de ${months} meses`,
    "caffeinated.subscription_alert.format.resubgift": (name, giftee, months) => `${name} le acaba de regalar a ${giftee} una sreuscripción de ${months} meses`,
    "caffeinated.subscription_alert.format.anonsubgift": (giftee, months) => `Anónimo le acaba de regalar a ${giftee} una suscripción de ${months} meses`,
    "caffeinated.subscription_alert.format.anonresubgift": (giftee, months) => `Anónimo le acaba de regalar a ${giftee} una resuscripción de ${months} meses`,

    // Credits
    "caffeinated.credits.title": "Créditos",

    // Settings
    "caffeinated.settings.title": "Configuración",
    "caffeinated.settings.signout": "Cerrar sesión",
    "caffeinated.settings.language": "Idioma",
    // TODO "caffeinated.settings.view_changelog": "View Changelog",
    // TODO "caffeinated.settings.chatbot_login": "Link chatbot account",
    // TODO "caffeinated.settings.chatbot_logout": "Unlink chatbot account",
    // TODO "caffeinated.settings.enable_discord_integration": "Enable Discord Integration",

    // Stream Uptime
    // TODO "caffeinated.uptime.title": "Stream Uptime",

    // Support Us
    "caffeinated.supporters.title": "Apóyennos",

    // Chat Display
    "caffeinated.chatdisplay.title": "Chat",
    "caffeinated.chatdisplay.join_text": (name) => `${name} se unió a la corriente`,
    "caffeinated.chatdisplay.leave_text": (name) => `${name} dejó la corriente`,
    "caffeinated.chatdisplay.follow_text": (name) => `${name} te comenzó a seguir`,
    "caffeinated.chatdisplay.reward_text": (name, title, image) => `${name} a canjeado ${image}${title}`,
    // TODO "caffeinated.chatdisplay.show_viewers": "Show Viewers",
    // TODO "caffeinated.chatdisplay.copy_chat_dock_link": "Copy Chat OBS Dock Link",
    // TODO "caffeinated.chatdisplay.copy_viewers_dock_link": "Copy Viewers List OBS Dock Link",

    // Chat
    "caffeinated.chat.title": "Chat",
    "caffeinated.chat.show_donations": "Mostrar Donaciones",
    "caffeinated.chat.chat_direction": "Direction",
    "caffeinated.chat.chat_animation": "Animación",
    "caffeinated.chat.text_align": "Alineación del Texto",

    // Donation Goal
    "caffeinated.donation_goal.title": "Objetivo de Donaciónes",
    "caffeinated.donation_goal.current_amount": "Monto actual",

    // Follower Goal
    "caffeinated.follower_goal.title": "Meta de Seguidores",

    // Generic Goal
    "caffeinated.generic_goal.name": "Título",
    "caffeinated.generic_goal.goal_amount": "Objetivo",
    "caffeinated.generic_goal.text_color": "Color del Título",
    "caffeinated.generic_goal.bar_color": "Color de la barra de progreso",

    // Donation Alert
    "caffeinated.donation_alert.title": "Alerta de Donación",
    "caffeinated.donation_alert.text_to_speech_voice": "Texto a Voz - opcinoes de Voz",

    // Follower Alert
    "caffeinated.follower_alert.title": "Alerta de Seguidor",
    "caffeinated.follower_alert.format.followed": (user) => `${user} te ha seguido`,

    // Spotify
    "spotify.integration.title": "Spotify",
    "spotify.integration.login": "Iniciar sesión de Spotify",
    "spotify.integration.logging_in": "Iniciando sesión",
    "spotify.integration.logged_in_as": (name) => `Conectado como ${name}, (Haga clic para cerrar la sesión)`,
    "spotify.integration.announce": "Anunciar Canción",
    "spotify.integration.enable_song_command": "Habilitar Comando de Canción",
    "spotify.integration.background_style": "Estilo de Fondo",
    "spotify.integration.image_style": "Estilo de Imagen",
    "spotify.integration.now_playing_announcment": (title, artist) => `Escuchando ${title} - ${artist}`,

    // View Counter
    "caffeinated.view_counter.title": "Contador de Espectadores",

    // Recent Follow
    "caffeinated.recent_follow.title": "Seguidor Reciente",

    // Donation Ticker
    "caffeinated.donation_ticker.title": "Ticker de Donación",

    // Top Donation
    "caffeinated.top_donation.title": "Donación Superior",

    // Recent Donation
    "caffeinated.recent_donation.title": "Donación Reciente",

    // Recent Subscription
    "caffeinated.recent_subscription.title": "Suscripción Reciente",

    // Chat Bot
    "caffeinated.chatbot.title": "Chat Bot",
    "caffeinated.chatbot.commands": "Comandos",
    "caffeinated.chatbot.follow_callout": "Notificación de Seguidor (Dejar en blanco para desactivar)",
    "caffeinated.chatbot.donation_callout": "Notificación de Donación (Dejar en blanco para desactivar)",
    "caffeinated.chatbot.welcome_callout": "Notificación de Unirse (Dejar en blanco para desactivar)",
    "caffeinated.chatbot.default_reply": "Casterlabs es un servicio gratuito de widgets para streaming!",
    "caffeinated.chatbot.command_type": "Tipo de Comando",
    "caffeinated.chatbot.trigger": "Disparador",
    "caffeinated.chatbot.reply": "Responder",
    // TODO "caffeinated.chatbot.uptime_command.enable": "Enable Uptime Command",
    // TODO "caffeinated.chatbot.uptime_command.format": (time) => `The stream has been up for ${time}`,
    // TODO "caffeinated.chatbot.uptime_command.not_live": "We're off the air",

    // Caffeine Integration
    "caffeine.integration.title": "Caffeine",
    "caffeine.integration.new_thumbnail": "Nueva Miniatura",
    "caffeine.integration.rating_selector": "Calificación del contenido",
    "caffeine.integration.title_selector": "Título",
    "caffeine.integration.game_selector": "Juego Seleccionado",
    "caffeine.integration.update": "Actualizar",

    // Casterlabs Companion
    "caffeinated.companion.title": "Casterlabs Companion",
    "caffeinated.companion.copy": "Copiar el link",
    "caffeinated.companion.reset": "Reiniciar el link"

}, "es-*");
