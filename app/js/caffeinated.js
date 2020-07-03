/* General include */
const electron = require("electron").remote
const dialog = electron.dialog
const Store = require("electron-store");
const {
    ipcMain,
    BrowserWindow
} = require("electron").remote
// const {dialog} = require("electron");
const store = new Store();
const toggleBackground = document.getElementById("toggleBackground");

/* Sockets IO (communication for local webservers) */
var express = require("express");
var cors = require("cors")
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

/* Koi global var */
var koi = new Koi("wss://live.casterlabs.co/koi");

/* Get user */
var currentUser = store.get("user");

app.use(cors());

server.listen(store.get("host_port"), "localhost");
console.log("Server running on port " + String(store.get("host_port")));

app.get("/", function (req, res) {
    res.send("pong");
});

app.get("/chat", function (req, res) {
    res.sendFile(__dirname + "/src/chat.html");
});

app.get("/followers", function (req, res) {
    res.sendFile(__dirname + "/src/followers.html");
});

app.get("/donations", function (req, res) {
    res.sendFile(__dirname + "/src/donations.html");
});

app.get("/goal", function (req, res) {
    res.sendFile(__dirname + "/src/goal.html");
});

app.get("/top-donators", function (req, res) {
    res.sendFile(__dirname + "/src/top-donators.html");
});

app.get("/media/follower-alert.mp3", function (req, res) {
    res.sendFile(store.get("follower_audio"));
});

app.get("/media/follower-gif.gif", function (req, res) {
    res.sendFile(store.get("follower_gif"));
});

app.get("/media/donation-alert.mp3", function (req, res) {
    res.sendFile(store.get("donation_audio"));
});

app.get("/media/donation-gif.gif", function (req, res) {
    res.sendFile(store.get("donation_gif"));
});

io.sockets.on("connection", function (socket) {
    console.log("New connection");
    io.sockets.emit("change chat color", store.get("chat_color_text"));
    io.sockets.emit("change follower color", store.get("follower_color_text"));
    io.sockets.emit("change donation color", store.get("donation_color_text"));
    io.sockets.emit("change goal title", store.get("goal_title"));
    io.sockets.emit("change goal text color", store.get("goal_color_text"));
    io.sockets.emit("change goal bar color", store.get("goal_color_bar"));
    var ioData = {
        total: store.get("goal"),
        current: store.get("goal_reached"),
        type: store.get("goal_type")
    };
    io.sockets.emit("goal", ioData);


    //Disconect
    socket.on("disconnect", function (data) {

    });

    socket.on("play audio", function (data) {
        var audio;
        if (data === "follower") {
            audio = new Audio(store.get("follower_audio"));
            audio.volume = store.get("follower_volume");
            if (store.get("follower_audio")) {
                audio.play();
            }
        }
        if (data === "donation") {
            audio = new Audio(store.get("donation_audio"));
            audio.volume = store.get("donation_volume");
            if (store.get("donation_audio")) {
                audio.play();
            }
        }
    });
});

function setVolume(type, value) {
    switch (type) {
        case "VOL_FOLLOWER":
            store.set("follower_volume", value);
            break;
        case "VOL_DONATION":
            store.set("donation_volume", value);
            break;
    }
}

document.getElementById("goalUSD").addEventListener("input", (event) => {
    var usd = document.getElementById("goalUSD").value;
    var credits = Math.round((usd / 0.00995024875) * 100) / 100;
    var gold = Math.round((credits / 3) * 100) / 100;

    store.set("goal", parseFloat(usd));
    var ioData = {
        total: store.get("goal"),
        current: store.get("goal_reached"),
        type: store.get("goal_type")
    };
    io.sockets.emit("goal", ioData);
});

let backgroundToggled = false;

toggleBackground.addEventListener("click", (event) => {
    backgroundToggled = !backgroundToggled;
    io.sockets.emit("toggle background", backgroundToggled);
});

const openOverlay = document.getElementById("openOverlay");

/* Open overlay as window */
openOverlay.addEventListener("click", (event) => {
    setTimeout(function () {
        io.sockets.emit("set overlay title", 1);
        io.sockets.emit("toggle background", backgroundToggled);
    }, 400);

    /* Followers */
    if (store.get("enable_follow")) {
        let win = new BrowserWindow({
            width: 300,
            height: 300,
            transparent: true,
            resizable: false,
            frame: false,
            alwaysOnTop: true,
            setVisibleOnAllWorkspaces: true
        });

        win.on("close", () => {
            win = null
        });
        win.loadURL("http://127.0.0.1:8080/followers");
        win.setAlwaysOnTop(true, "floating", 1);
        win.setVisibleOnAllWorkspaces(true);
        win.show();
    }

    /* Donations */
    if (store.get("enable_donation")) {
        let win = new BrowserWindow({
            width: 300,
            height: 300,
            transparent: true,
            resizable: false,
            frame: false,
            alwaysOnTop: true
        });

        win.on("close", () => {
            win = null
        });
        win.loadURL("http://127.0.0.1:8080/donations");
        win.setAlwaysOnTop(true, "floating", 1);
        win.setVisibleOnAllWorkspaces(true);
        win.show();
    }

    /* Chat */
    if (store.get("enable_chat")) {
        var chatHeight = parseInt(store.get("chat_entries")) * 35;
        let win = new BrowserWindow({
            width: 900,
            height: chatHeight,
            transparent: true,
            resizable: false,
            frame: false,
            alwaysOnTop: true
        });

        win.on("close", () => {
            win = null
        });
        win.loadURL("http://127.0.0.1:8080/chat");
        win.setAlwaysOnTop(true, "floating", 1);
        win.setVisibleOnAllWorkspaces(true);
        win.show();
    }

    /* Goal */
    if (store.get("enable_goal")) {
        let win = new BrowserWindow({
            width: 900,
            height: 100,
            transparent: true,
            resizable: false,
            frame: false,
            alwaysOnTop: true
        });

        win.on("close", () => {
            win = null
        });
        win.loadURL("http://127.0.0.1:8080/goal");
        win.setAlwaysOnTop(true, "floating", 1);
        win.setVisibleOnAllWorkspaces(true);
        win.show();
    }
})

/* File selector */
function selectFile(type) {
    var filePath;
    dialog.showOpenDialog({
        properties: ["openFile"]
    }).then(result => {
        console.log(result.canceled);
        if (!result.canceled) {
            filePath = result.filePaths;
            filePath = filePath[0];
            switch (type) {
                case "FOLLOWER_GIF":
                    store.set("follower_gif", filePath);
                    io.sockets.emit("reload", 1);
                    break;
                case "FOLLOWER_MP3":
                    store.set("follower_audio", filePath);
                    break;
                case "DONATION_GIF":
                    store.set("donation_gif", filePath);
                    io.sockets.emit("reload", 1);
                    break;
                case "DONATION_MP3":
                    store.set("donation_audio", filePath);
                    break;
            }
        }
    }).catch(err => {
        console.log(err);
    });
}

/* Generate donator table from config.json */
function donatorTableUpdate() {
    var donatorList = store.get("donator_list");
    var user = store.get("user");
    txt = "<table><thead><tr><th>User</th><th>USD</th></tr></thead><tbody>";
    for (var key in donatorList[user]) {
        // console.log("Key: " + key);
        // console.log("Value: " + obj.d[key]);
        txt += "<tr><td>" + key + "</td><td>" + donatorList[user][key] + "</td></tr>";
    }
    txt += "</tbody></table>";
    document.getElementById("donatorTable").innerHTML = txt;
}

/* Splash screen */
var splashActive = true;

function splashScreen(state) {
    var splash = document.getElementById("splash");
    var content = document.getElementById("content");
    if (!state) {
        /* Remove */
        if (splashActive) {
            splash.classList.add("hide");
            content.classList.remove("hide");
        }
        splashActive = false;
    } else {
        /* Generate */
        if (!splashActive) {
            splash.classList.remove("hide");
            content.classList.add("hide");
        }
        splashActive = true;
    }
}

/* Catch errors */
koi.onerror = event => {
    console.log(event);
    var error = event.error;
    switch (error) {
        case "USER_ID_INVALID":
            /* User does not exist */
            new window.Notification(notificationUserNotFound.title, notificationUserNotFound);
            splashScreen(false);
            store.delete("user");
            break;
    }
}

/* */
koi.oninfo = event => {
    console.log("INFO:");
    console.log(event);
}

/* Auto-reconnect */
koi.ws.onclose = () => {
    console.log("Reconnecting")
    koi = new Koi("wss://live.casterlabs.co/koi");
}

/* Get user info and start up listeners */
if (currentUser !== undefined) {
    /* Koi */
    koi.onopen = event => {
        console.log("Open");
        koi.addUser(currentUser);
    };
    donatorTableUpdate();
} else {
    /* Remove splash screen and show content */
    splashScreen(false);
}

koi.onstatus = event => {
    console.log(event);
    userInfo = event.streamer;
    document.getElementById("menuAvatar").src = userInfo.image_link;
    var username = userInfo.username;
    try {
        var tempUsername = userInfo.displayname;
        if (tempUsername !== null || tempUsername !== undefined) {
            username = tempUsername;
        }
    } catch (e) {
        // do nothing?
    }
    document.getElementById("greetings").innerHTML = "Hey, " + username + "!";
    document.getElementById("followersTitle").innerHTML = "Followers";
    document.getElementById("followerCount").innerHTML = userInfo.follower_count;

    /* Set goal */
    if (store.get("goal") !== undefined) {
        var usd = store.get("goal");
        document.getElementById("goalUSD").value = usd;
    }

    /* Remove splash screen and show content */
    splashScreen(false);
};

koi.onupdate = event => {
    console.log(event);
    userInfo = event.streamer;
    document.getElementById("menuAvatar").src = userInfo.image_link;
    var username = userInfo.username;
    try {
        var tempUsername = userInfo.displayname;
        if (tempUsername !== null || tempUsername !== undefined) {
            username = tempUsername;
        }
    } catch (e) {
        // do nothing?
    }
    document.getElementById("greetings").innerHTML = "Hey, " + username + "!";
    document.getElementById("followersTitle").innerHTML = "Followers";
    document.getElementById("followerCount").innerHTML = userInfo.follower_count;

    /* Set goal */
    if (store.get("goal") !== undefined) {
        var usd = store.get("goal");
        document.getElementById("goalUSD").value = usd;
    }

    /* Remove splash screen and show content */
    splashScreen(false);
}

koi.onchat = event => {
    console.log(event);
    var ioData = {
        "username": event.sender.username,
        "text": event.message,
        "max_entries": store.get("chat_entries")
    };
    if (store.get("enable_chat")) {
        io.sockets.emit("add chat", ioData)
    }
}

koi.onfollow = event => {
    console.log(event);
    var follower = event.follower;
    var ioData = {
        "username": follower.username,
        "text": "just followed",
        "gif": store.get("follower_gif"),
        "timeout": store.get("follower_timeout")
    };
    var followText = store.get("follower_text");
    if (followText !== undefined && followText.length > 1) {
        ioData.text = followText;
    }
    if (store.get("enable_follow")) {
        io.sockets.emit("follower alert", ioData);
    }
}

koi.ondonation = event => {
    console.log(event);
    var donator = event.sender.username;
    var ioData = {
        "username": donator,
        "donationMessage": event.message,
        "text": store.get("donation_text"),
        "gif": store.get("donation_gif"),
        "timeout": store.get("donation_timeout"),
        "prop": event.image
    };
    if (store.get("enable_donation")) {
        io.sockets.emit("donation alert", ioData);
    }

    /* Update donation log */
    var goalReached = store.get("goal_reached");
    goalReached += event.usd_equivalent;
    store.set("goal_reached", goalReached);
    document.getElementById("goalReached").value = goalReached;
    var ioData = {
        total: store.get("goal"),
        current: store.get("goal_reached"),
        type: store.get("goal_type")
    };
    io.sockets.emit("goal", ioData);

    /* Update donator list */
    var donatorList = store.get("donator_list");
    if (donatorList.hasOwnProperty(currentUser)) {
        var donatorListUser = donatorList[currentUser];
        if (donatorListUser.hasOwnProperty(donator)) {
            var donatedAmount = donatorListUser[donator];
            donatedAmount += event.usd_equivalent;
            donatorListUser[donator] = donatedAmount;
        } else {
            donatorListUser[donator] = event.usd_equivalent;
        }
        donatorList[currentUser] = donatorListUser;
    } else {
        donatorList[currentUser] = {
            [donator]: event.usd_equivalent
        };
    }
    store.set("donator_list", donatorList);
    donatorTableUpdate();
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Error notification */
const notificationUserNotFound = {
    title: "Caffeinated",
    body: "User not found "
}

function getJSON(str) {
    try {
        return (JSON.parse(str));
    } catch (e) {
        return false;
    }
}

setInterval(() => {
    io.sockets.emit("ping", 1);
}, 1000);


/* Settings - set user */
var userInput = document.getElementById("setUserInput");

function saveUser() {
    var newUser = userInput.value;
    if (currentUser !== undefined) {
        koi.removeUser(currentUser);
    }
    koi.addUser(newUser);
    currentUser = newUser;
    store.set("user", newUser);
    donatorTableUpdate();
}

document.getElementById("setUser").addEventListener("click", function () {
    saveUser();
});

userInput.addEventListener("keyup", event => {
    if (event.keyCode === 13) {
        event.preventDefault();
        saveUser();
    }
});

document.getElementById("testFollower").addEventListener("click", function () {
    if (currentUser !== undefined) {
        koi.test(currentUser, "FOLLOW");
    } else {
        koi.test("Casterlabs", "FOLLOW");
    }
});

document.getElementById("testDonation").addEventListener("click", function () {
    if (currentUser !== undefined) {
        koi.test(currentUser, "DONATION");
    } else {
        koi.test("Casterlabs", "DONATION");
    }
});

document.getElementById("testChat").addEventListener("click", function () {
    if (currentUser !== undefined) {
        koi.test(currentUser, "CHAT");
    } else {
        koi.test("Casterlabs", "CHAT");
    }
});

function checkBox(id) {
    store.set(String(id), !(store.get(String(id))));
}

var hostPort = document.getElementById("hostPort");
hostPort.addEventListener("input", hostPortSet);

function hostPortSet() {
    store.set("host_port", parseInt(hostPort.value));
}

var timeoutFollowers = document.getElementById("followerTimeout");
timeoutFollowers.addEventListener("input", timeoutFollowersSet);

function timeoutFollowersSet() {
    store.set("follower_timeout", parseInt(timeoutFollowers.value));
}

var timeoutDonations = document.getElementById("donationTimeout");
timeoutDonations.addEventListener("input", timeoutDonationsSet);

function timeoutDonationsSet() {
    store.set("donation_timeout", parseInt(timeoutDonations.value));
}

var maxChatInput = document.getElementById("chatEntries");
maxChatInput.addEventListener("input", maxChatSet);

function maxChatSet() {
    store.set("chat_entries", parseInt(maxChatInput.value));
}

var setChatTextColor = document.getElementById("chatColorText");
setChatTextColor.addEventListener("input", setChatTextColorSet);

function setChatTextColorSet() {
    store.set("chat_color_text", String(setChatTextColor.value));
    io.sockets.emit("change chat color", setChatTextColor.value);
}

var setFollowerColor = document.getElementById("followerColorText");
setFollowerColor.addEventListener("input", setFollowerColorSet);

function setFollowerColorSet() {
    store.set("follower_color_text", String(setFollowerColor.value));
    io.sockets.emit("change follower color", setFollowerColor.value);
}

var setDonationColor = document.getElementById("donationColorText");
setDonationColor.addEventListener("input", setDonationColorSet);

function setDonationColorSet() {
    store.set("donation_color_text", String(setDonationColor.value));
    io.sockets.emit("change donation color", setDonationColor.value);
}

var goalTitle = document.getElementById("goalTitle");
goalTitle.addEventListener("input", goalTitleSet);

function goalTitleSet() {
    store.set("goal_title", goalTitle.value);
    io.sockets.emit("change goal title", goalTitle.value);
}

var setGoalTextColor = document.getElementById("goalColorText");
setGoalTextColor.addEventListener("input", setGoalTextColorSet);

function setGoalTextColorSet() {
    store.set("goal_color_text", String(setGoalTextColor.value));
    io.sockets.emit("change goal text color", setGoalTextColor.value);
}

var setGoalBarColor = document.getElementById("goalColorBar");
setGoalBarColor.addEventListener("input", setGoalBarColorSet);

function setGoalBarColorSet() {
    store.set("goal_color_bar", String(setGoalBarColor.value));
    io.sockets.emit("change goal bar color", setGoalBarColor.value);
}

var goalReached = document.getElementById("goalReached");
goalReached.addEventListener("input", goalReachedSet);

function goalReachedSet() {
    store.set("goal_reached", parseFloat(goalReached.value));
    var ioData = {
        total: store.get("goal"),
        current: store.get("goal_reached"),
        type: store.get("goal_type")
    };
    io.sockets.emit("goal", ioData);
}

var goalType = document.getElementById("goalTypes");
goalType.addEventListener("input", goalTypeSet);

function goalTypeSet() {
    store.set("goal_type", parseInt(goalTypes.selectedIndex));
    var ioData = {
        total: store.get("goal"),
        current: store.get("goal_reached"),
        type: store.get("goal_type")
    };
    io.sockets.emit("goal", ioData);
}

function clipboard(copy) {
    navigator.clipboard.writeText("http://127.0.0.1:" + store.get("host_port") + "/" + copy).then(function () {
        console.log("Async: Copying to clipboard was successful!");
    }, function (err) {
        console.error("Async: Could not copy text: ", err);
    });
}

/* This handles tab switch in Electron window */
function switchContent(obj) {
    obj = (!obj) ? "sub1" : obj;

    var contentDivs = document.getElementsByTagName("div");
    for (i = 0; i < contentDivs.length; i++) {
        if (contentDivs[i].id && contentDivs[i].id.indexOf("sub") !== -1) {
            contentDivs[i].className = "hide";
        }
    }
    document.getElementById(obj).className = "sub";
}

function checkTab() {
    $("a").each(function () {
        $(this).click(function () {
            tab = $(this).attr("href").split("#");
            switchContent(tab[1]);
            // Have to set active class for active tab...
            // $(".active").removeClass("active");
            // $(this).toggleClass(".active");
        });
    });
}

window.onload = function () {
    checkTab();
};