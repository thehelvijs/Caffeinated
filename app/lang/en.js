LANG.absorbLang({
    "meta.language.name": "English",
    "meta.language.name.native": "English",
    "meta.language.code": "en-*",

    // UI
    "caffeinated.internal.widgets": "Widgets",
    "caffeinated.internal.followers_count_text": (count) => `${count} ${(count == 1 ? "follower" : "followers")}`,
    "caffeinated.internal.subscribers_count_text": (count) => `${count} ${(count == 1 ? "subscriber" : "subscribers")}`,

    // Generic
    "generic.enabled": "Enabled",
    "generic.font": "Font",
    "generic.font.size": "Font Size (px)",
    "generic.text.color": "Text Color",
    "generic.background.color": "Background Color",
    "generic.volume": "Volume",
    "generic.alert.audio": "Alert Audio",
    "generic.alert.image": "Alert Image",
    "generic.audio.file": "Audio File",
    "generic.image.file": "Image File",
    "generic.currency": "Currency",
    "generic.enable_audio": "Enable Custom Audio",
    "generic.use_custom_image": "Use Custom Image",
    "generic.height": "Height (px)",
    "generic.height": "Width (px)",

    // Video Share
    "caffeinated.videoshare.title": "Video Share",
    "caffeinated.videoshare.donations_only": "Donations Only",
    "caffeinated.videoshare.skip": "Skip",
    "caffeinated.videoshare.pause": "Play/Pause",
    "caffeinated.videoshare.player_only": "Player Only (No frame)",

    // Raid
    "caffeinated.raid_alert.title": "Raid Alert",
    "caffeinated.raid_alert.format.now_raiding": (raider, viewers) => `${raider} just raided with ${viewers} ${(viewers == 1) ? "viewer" : "viewers"}`,

    // Subscription Goal
    "caffeinated.subscription_goal.title": "Subscription Goal",

    // Subscription
    "caffeinated.subscription_alert.title": "Subscription Alert",
    "caffeinated.subscription_alert.format.sub": (name, months) => `${name} just subscribed for ${months} ${(months == 1) ? "month" : "months"}`,
    "caffeinated.subscription_alert.format.resub": (name, months) => `${name} just resubscribed for ${months} ${(months == 1) ? "month" : "months"}`,
    "caffeinated.subscription_alert.format.subgift": (name, giftee, months) => `${name} just gifted ${giftee} a ${months} month subscription`,
    "caffeinated.subscription_alert.format.resubgift": (name, giftee, months) => `${name} just gifted ${giftee} a ${months} month resubscription`,
    "caffeinated.subscription_alert.format.anonsubgift": (giftee, months) => `Anonymous just gifted ${giftee} a ${months} month subscription`,
    "caffeinated.subscription_alert.format.anonresubgift": (giftee, months) => `Anonymous just gifted ${giftee} a ${months} month resubscription`,

    // Credits
    "caffeinated.credits.title": "Credits",

    // Settings
    "caffeinated.settings.title": "Settings",
    "caffeinated.settings.signout": "Sign out",
    "caffeinated.settings.language": "Language",
    "caffeinated.settings.view_changelog": "View Changelog",
    "caffeinated.settings.chatbot_login": "Link chatbot account",
    "caffeinated.settings.chatbot_logout": "Unlink chatbot account",
    "caffeinated.settings.enable_discord_integration": "Enable Discord Integration",

    // Stream Uptime
    "caffeinated.uptime.title": "Stream Uptime",

    // Support Us
    "caffeinated.supporters.title": "Support Us",

    // Chat Display
    "caffeinated.chatdisplay.title": "Chat",
    "caffeinated.chatdisplay.join_text": (name) => `${name} joined the stream`,
    "caffeinated.chatdisplay.leave_text": (name) => `${name} left the stream`,
    "caffeinated.chatdisplay.follow_text": (name) => `${name} started following`,
    "caffeinated.chatdisplay.reward_text": (name, title, image) => `${name} just redeemed ${image}${title}`,
    "caffeinated.chatdisplay.show_viewers": "Show Viewers",
    "caffeinated.chatdisplay.copy_chat_dock_link": "Copy Chat OBS Dock Link",
    "caffeinated.chatdisplay.copy_viewers_dock_link": "Copy Viewers List OBS Dock Link",

    // Chat
    "caffeinated.chat.title": "Chat",
    "caffeinated.chat.show_donations": "Show Donations",
    "caffeinated.chat.chat_direction": "Direction",
    "caffeinated.chat.chat_animation": "Animation",
    "caffeinated.chat.text_align": "Text Align",

    // Donation Goal
    "caffeinated.donation_goal.title": "Donation Goal",
    "caffeinated.donation_goal.current_amount": "Current Amount",

    // Follower Goal
    "caffeinated.follower_goal.title": "Follower Goal",

    // Generic Goal
    "caffeinated.generic_goal.name": "Title",
    "caffeinated.generic_goal.goal_amount": "Target Amount",
    "caffeinated.generic_goal.text_color": "Title Color",
    "caffeinated.generic_goal.bar_color": "Progress Bar Color",

    // Donation Alert
    "caffeinated.donation_alert.title": "Donation Alert",
    "caffeinated.donation_alert.text_to_speech_voice": "TTS Voice",

    // Follower Alert
    "caffeinated.follower_alert.title": "Follower Alert",
    "caffeinated.follower_alert.format.followed": (user) => `${user} just followed`,

    // Spotify
    "spotify.integration.title": "Spotify",
    "spotify.integration.login": "Login with Spotify",
    "spotify.integration.logging_in": "Logging in",
    "spotify.integration.logged_in_as": (name) => `Logged in as ${name} (Click to log out)`,
    "spotify.integration.announce": "Announce Song",
    "spotify.integration.enable_song_command": "Enable Song Command",
    "spotify.integration.background_style": "Background Style",
    "spotify.integration.image_style": "Image Style",
    "spotify.integration.now_playing_announcment": (title, artist) => `Now playing: ${title} - ${artist}`,

    // View Counter
    "caffeinated.view_counter.title": "View Counter",

    // Recent Follow
    "caffeinated.recent_follow.title": "Recent Follow",

    // Donation Ticker
    "caffeinated.donation_ticker.title": "Donation Ticker",

    // Top Donation
    "caffeinated.top_donation.title": "Top Donation",

    // Recent Donation
    "caffeinated.recent_donation.title": "Recent Donation",

    // Recent Subscription
    "caffeinated.recent_subscription.title": "Recent Subscription",

    // Follow Counter
    "caffeinated.follow_counter.title": "Follow Counter",

    // Subscriber Counter
    "caffeinated.subscriber_counter.title": "Subscriber Counter",

    // Chat Bot
    "caffeinated.chatbot.title": "Chat Bot",
    "caffeinated.chatbot.commands": "Commands",
    "caffeinated.chatbot.follow_callout": "Follow Callout (Leave blank to disable)",
    "caffeinated.chatbot.donation_callout": "Donation Callout (Leave blank to disable)",
    "caffeinated.chatbot.welcome_callout": "Welcome Callout (Leave blank to disable)",
    "caffeinated.chatbot.default_reply": "Casterlabs is a free stream widget service!",
    "caffeinated.chatbot.command_type": "Command Type",
    "caffeinated.chatbot.trigger": "Trigger",
    "caffeinated.chatbot.reply": "Reply",
    "caffeinated.chatbot.uptime_command.enable": "Enable Uptime Command",
    "caffeinated.chatbot.uptime_command.format": (time) => `The stream has been up for ${time}`,
    "caffeinated.chatbot.uptime_command.not_live": "We're off the air",

    // Caffeine Integration
    "caffeine.integration.title": "Caffeine",
    "caffeine.integration.new_thumbnail": "New thumbnail",
    "caffeine.integration.rating_selector": "Content Rating",
    "caffeine.integration.title_selector": "Title",
    "caffeine.integration.game_selector": "Selected Game",
    "caffeine.integration.update": "Update",

    // Casterlabs Companion
    "caffeinated.companion.title": "Casterlabs Companion",
    "caffeinated.companion.copy": "Copy Link",
    "caffeinated.companion.reset": "Reset Link"

}, "en-*");
