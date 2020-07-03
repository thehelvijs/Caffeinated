const { remote } = require("electron");
const Store = require("electron-store");
const store = new Store();

var directory = __dirname;
directory = directory.substring(0, directory.length - 2);

const defaultCheckboxes = {
    "audio_follow": true,
    "gif_follow": true,
    "audio_donation": true,
    "gif_donation": true,
    "enable_follow": true,
    "enable_donation": true,
    "enable_chat": false,
    "enable_goal": false
}

const defaultSettings = {
    "host_port": 8080,
    "chat_entries": 5,
    "chat_color_text": "#ffffff",
    "follower_timeout": 5,
    "follower_audio": directory + "media/follower.mp3",
    "follower_gif": directory + "media/follower.gif",
    "follower_color_text": "#31f8ff",
    "follower_text": "just followed",
    "follower_volume": 1,
    "donation_timeout": 10,
    "donation_color_text": "#31f8ff",
    "donation_audio": directory + "media/donation.mp3",
    "donation_gif": directory + "media/donation.gif",
    "donation_text": "just donated",
    "donation_volume": 1,
    "donator_list": {},
    "goal_color_text": "#ffffff",
    "goal_color_bar": "#31f8ff",
    "goal_reached": 0,
    "goal_type": 0,
    "goal_title": "Snacks and beer"
}

// store.clear();

let currWindow = remote.BrowserWindow.getFocusedWindow();

window.closeCurrentWindow = function () {
    currWindow.close();
}

window.addEventListener("DOMContentLoaded", () => {
    updateElements();
});

init();

function init() {
    /* Settings */
    for (setting in defaultSettings) {
        var key = setting;
        if (store.get(setting) === undefined) {
            store.set(setting, defaultSettings[setting]);
        }
        // This does not work. Cant pass JSON key as a String for element ID (had to it manually on updateElements())
        // document.getElementById(key).value = store.get(key);
    }
}

function updateElements() {
    /* Checkboxes */
    for (checkbox in defaultCheckboxes) {
        if (store.get(checkbox) === undefined) {
            store.set(checkbox, defaultCheckboxes[checkbox]);
        }
        document.getElementById(checkbox).checked = store.get(checkbox);
    }

    document.getElementById("hostPort").value = store.get("host_port");
    document.getElementById("followerTimeout").value = store.get("follower_timeout");
    document.getElementById("donationTimeout").value = store.get("donation_timeout");
    document.getElementById("chatEntries").value = store.get("chat_entries");
    document.getElementById("chatColorText").value = store.get("chat_color_text");
    document.getElementById("followerColorText").value = store.get("follower_color_text");
    document.getElementById("donationColorText").value = store.get("donation_color_text");
    var goalTitle = store.get("goal_title");
    if (goalTitle !== undefined) {
        document.getElementById("goalTitle").value = goalTitle;
    }
    document.getElementById("goalColorText").value = store.get("goal_color_text");
    document.getElementById("goalColorBar").value = store.get("goal_color_bar");
    document.getElementById("goalReached").value = store.get("goal_reached");
    document.getElementById("goalTypes").selectedIndex = store.get("goal_type");
    document.getElementById("goalUSD").value = store.get("goal");
    document.getElementById("followerVolume").value = store.get("follower_volume");
    document.getElementById("donationVolume").value = store.get("donation_volume");

    console.log("Settings initialized")
}
