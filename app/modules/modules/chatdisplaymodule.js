
MODULES.moduleClasses["casterlabs_chat_display"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat_display";
        this.displayname = "caffeinated.chatdisplay.title";
        this.type = "application";
        this.id = id;
        this.icon = "chatbox";

        this.messageHistory = [];

        // Where the magic happens
        this.pageSrc = __dirname + "/modules/modules/chatdisplay.html";

        this.viewersList = [];
    }

    init() {
        this.contentWindow = this.page.querySelector("iframe").contentWindow;
        this.contentDocument = this.contentWindow.document;

        koi.addEventListener("chat", (event) => {
            this.addMessage(event);
        });

        koi.addEventListener("donation", (event) => {
            event.donations.forEach((donation) => {
                donation.display = formatCurrency(donation.amount, donation.currency);
            });

            this.addMessage(event);
        });

        koi.addEventListener("upvote", (event) => {
            this.messageUpvote(event);
        });

        koi.addEventListener("follow", (event) => {
            this.addStatus(event.follower.username, event.follower.image_link, event.follower.color, "follow");
        });

        koi.addEventListener("viewer_join", (event) => {
            this.addStatus(event.viewer.username, event.viewer.image_link, event.color, "join");
        });

        koi.addEventListener("viewer_leave", (event) => {
            this.addStatus(event.viewer.username, event.viewer.image_link, event.color, "leave");
        });

        koi.addEventListener("viewer_list", (event) => {
            this.viewersList = event.viewers;

            this.updateViewers();
        });

        /* Listeners */

        this.contentDocument.addEventListener("upvote_request", (e) => {
            koi.upvote(e.detail.id);
        });

        this.contentDocument.addEventListener("open_link", (e) => {
            openLink(e.detail.link);
        });

        this.contentDocument.querySelector("#vcpopoutviewers").addEventListener("click", () => {
            this.createViewersWindow();
        });

        this.contentDocument.querySelector("#vcpopout").addEventListener("click", () => {
            this.createPopoutWindow();
        });

        const messageInput = this.contentDocument.querySelector("#vcmessage");

        messageInput.addEventListener("keyup", (e) => {
            if (e.key == "Enter") {
                koi.sendMessage(messageInput.value);
                messageInput.value = "";
            }
        });

        this.contentDocument.querySelector("#vcsend").addEventListener("click", () => {
            koi.sendMessage(messageInput.value);
            messageInput.value = "";
        });
    }

    createViewersWindow() {
        if (!this.viewersWindow) {
            const mainWindowState = windowStateKeeper({
                defaultWidth: 200,
                defaultHeight: 500,
                file: "caffeinated-viewers-popout-window.json"
            });

            this.viewersWindow = new BrowserWindow({
                minWidth: 200,
                minHeight: 500,
                width: mainWindowState.width,
                height: mainWindowState.height,
                x: mainWindowState.x,
                y: mainWindowState.y,
                resizable: true,
                transparent: false,
                alwaysOnTop: true,
                show: false,
                titleBarStyle: "shown",
                icon: "https://assets.casterlabs.co/logo/casterlabs_icon.png",
                frame: false,
                webPreferences: {
                    nodeIntegration: true
                }
            });

            this.contentDocument.querySelector("#vcpopoutviewers").classList.add("hide");

            this.viewersWindow.once("close", () => {
                this.contentDocument.querySelector("#vcpopoutviewers").classList.remove("hide");
                this.viewersWindow = null;
            });

            this.viewersWindow.once("ready-to-show", () => {
                this.updateViewers();

                this.viewersWindow.show();
            });

            this.viewersWindow.loadFile(__dirname + "/modules/modules/chatviewers.html");

            mainWindowState.manage(this.viewersWindow);
        }
    }

    createPopoutWindow() {
        if (!this.popoutWindow) {
            const mainWindowState = windowStateKeeper({
                defaultWidth: 300,
                defaultHeight: 500,
                file: "caffeinated-chat-popout-window.json"
            });

            this.popoutWindow = new BrowserWindow({
                minWidth: 300,
                minHeight: 500,
                width: mainWindowState.width,
                height: mainWindowState.height,
                x: mainWindowState.x,
                y: mainWindowState.y,
                resizable: true,
                transparent: false,
                alwaysOnTop: true,
                show: false,
                titleBarStyle: "shown",
                icon: "https://assets.casterlabs.co/logo/casterlabs_icon.png",
                frame: false,
                webPreferences: {
                    nodeIntegration: true
                }
            });

            this.contentDocument.querySelector("#vcpopout").classList.add("hide");

            this.popoutWindow.once("close", () => {
                this.contentDocument.querySelector("#vcpopout").classList.remove("hide");
                this.popoutWindow = null;
            });

            this.popoutWindow.once("ready-to-show", () => {
                this.popoutWindow.show();

                this.popoutWindow.webContents.executeJavaScript(`catchUp(${JSON.stringify(this.messageHistory)})`);
            });

            this.popoutWindow.addListener("upvote_request", (id) => {
                koi.upvote(id);
            });

            this.popoutWindow.addListener("send_message", (message) => {
                koi.sendMessage(message);
            });

            this.popoutWindow.loadFile(__dirname + "/modules/modules/chatdisplay.html");

            mainWindowState.manage(this.popoutWindow);
        }
    }

    updateViewers() {
        if (this.viewersWindow) {
            this.viewersWindow.webContents.executeJavaScript(`setViewers(${JSON.stringify(this.viewersList)})`);
        }
    }

    messageUpvote(event, onlyPopout) {
        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(`messageUpvote(${JSON.stringify(event)})`);
        }

        if (!onlyPopout) {
            this.messageHistory.push({
                type: "UPVOTE",
                event: Object.assign({}, event)
            });

            this.contentWindow.messageUpvote(event);
        }
    }

    addMessage(event, onlyPopout) {
        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(`addMessage(${JSON.stringify(event)})`);
        }

        if (!onlyPopout) {
            this.messageHistory.push({
                type: "MESSAGE",
                event: Object.assign({}, event)
            });

            this.contentWindow.addMessage(event);
        }
    }

    addStatus(user, profilePic, color, type, onlyPopout) {
        if (this.popoutWindow) {
            this.popoutWindow.webContents.executeJavaScript(`addStatus(${JSON.stringify(user)}, ${JSON.stringify(profilePic)}, ${JSON.stringify(color)}, ${JSON.stringify(type)})`);
        }

        if (!onlyPopout) {
            this.messageHistory.push({
                type: "STATUS",
                user: user,
                profilePic: profilePic,
                color: color,
                statusType: type
            });

            this.contentWindow.addStatus(user, profilePic, color, type);
        }
    }

};
