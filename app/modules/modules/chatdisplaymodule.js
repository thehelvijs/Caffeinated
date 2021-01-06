
MODULES.moduleClasses["casterlabs_chat_display"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat_display";
        this.type = "application";
        this.id = id;
        this.icon = "chatbox";
        this.displayname = "Chat";

        this.viewersList = [];

        koi.addEventListener("chat", (event) => {
            this.util.addMessage(event);
        });

        koi.addEventListener("donation", (event) => {
            event.donations.forEach((donation) => {
                donation.display = formatCurrency(donation.amount, donation.currency);
            });

            this.util.addMessage(event);
        });

        koi.addEventListener("upvote", (event) => {
            this.util.messageUpvote(event);
        });

        koi.addEventListener("follow", (event) => {
            this.util.addStatus(event.follower.username, event.follower.image_link, event.follower.color, "follow");
        });

        koi.addEventListener("viewer_join", (event) => {
            this.util.addStatus(event.viewer.username, event.viewer.image_link, event.color, "join");
        });

        koi.addEventListener("viewer_leave", (event) => {
            this.util.addStatus(event.viewer.username, event.viewer.image_link, event.color, "leave");
        });

        koi.addEventListener("viewer_list", (event) => {
            this.viewersList = event.viewers;

            this.util.updateViewers();
        });

    }

    init() {
        this.page.innerHTML = `
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap" rel="stylesheet" />
        <style>
            .vcbuttons {
                position: fixed;
                right: 10px;
                bottom: 0px;
                left: var(--menu-width);
                z-index: 1000;
                background-color: #141414;
                display: flex;
                padding-top: 7px;
                justify-content: center;
            }

            .upvote-1 {
                /* 1+ */
                color: #FF00FF;
            }

            .upvote-2 {
                /* 10+ */
                color: #00FF00;
            }

            .upvote-3 {
                /* 100+ */
                color: #FFFF00;
            }

            .upvote-4 {
                /* 1000+ */
                color: #FFFFFF;
            }

            .vcbuttons .item {
                height: 30px;
                font-size: 15px;
                padding-top: 0;
                padding-bottom: calc(.2em - 1px);
                -webkit-app-region: no-drag;
            }
            
            .vcbuttons input {
                width: 300px;
                margin-bottom: 8px;
                margin-right: 2px;
            }
            
            .vcviewicon {
                padding-top: 10px;
            }

            .verticalchatmodule span {
                font-family: "Inter", sans-serif;
                color: white;
            }
        
            .vctext::before {
                content: "\\00a0";
            }
        
            .vctext {
                border-radius: 1px;
            }
        
            .vctext::after {
                content: "\\00a0";
            }
        
            .vcusername::after {
                content: "\\00a0";
            }
        
            .vcstatus {
                position: relative;
                font-style: italic;
                display: flex;
                align-items: center;
            }

            .vcstatus .vctext {
                color: #D0D0D0;
            }

            .vcchatmessage {
                position: relative;
                display: flex;
                align-items: center;
                border-radius: 8px;
                cursor: default;
            }

            .vcprofile {
                border-radius: 50%;
                object-fit: cover;
                height: 22px;
                width: 22px;
                margin: 1px 3px;
                vertical-align: bottom;
            }

            .vcimage {
                border-radius: 50%;
                object-fit: cover;
                height: 22px;
                width: auto;
                margin: 1px;
                vertical-align: bottom;
            }

            .verticalchatmodule {
                margin-bottom: 35px;
                margin-top: 25px;
                overflow-x: wrap;
            }

            ul {
                list-style: none;
            }
              
            ul#chatbox>li {
                height: auto;
                position: relative;
                list-style: none;
                margin-left: -30px;
            }
            
            ul li ul {
                display: none;
            }
            
            ul li a {
                display: inline-block;
                height: 100%;
                text-decoration: none;
                color: white !important;
            }
            
            ul li:hover ul {
                display: block;
            }

            ul li:hover > .vcchatmessage { 
                background-color: #4d4d4d;
            }
            
            ul.tip {
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                display: none;
                background-color: #4d4d4d;
                position: absolute;
                bottom: 100%;
                padding: 0;
                height: auto;
                left: 0;
                right: 0;
                z-index: 1;
                width: 40px;
                height: 30px;
            }

            .tooltipbtn {
                font-size: 20px;
                margin-left: 10px;
                margin-top: 5px;
            }

            .vcbadge {
                padding-left: 3px;
                transform: translateY(5px);
                height: 20px;
                width: auto;
            }

            #vcjumpdown {
                position: fixed;
                bottom: 100px;
                right: 30px;
            }

            #vcjumpdown ion-icon {
                width: 40px;
                height: 40px;
            }
        </style>
        <div class="container verticalchatmodule">
            <ul id="chatbox"></ul>
            <div class="vcbuttons">
                <input class="input item" id="vcmessage" />
                <button class="button item" id="vcsend">
                    Send
                </button>
                <button class="button item" id="vcopen">
                    Viewers
                </button>
            </div>
            <a id="vcjumpdown" title="Jump to bottom" style="opacity: 0;">
                <ion-icon name="arrow-down-circle"></ion-icon>
            </a>
        </div>
        `;

        this.util = new VerticalChatUtil(this);
    }

};

class VerticalChatUtil {

    constructor(module) {
        this.module = module;

        const messageInput = this.module.page.querySelector("#vcmessage");

        this.module.page.querySelector("#vcopen").addEventListener("click", () => {
            this.createWindow();
        });

        this.module.page.querySelector("#vcjumpdown").addEventListener("click", () => {
            this.jumpDown();
        });

        messageInput.addEventListener("keyup", (e) => {
            if (e.key == "Enter") {
                koi.sendMessage(messageInput.value);
                messageInput.value = "";
            }
        });

        this.module.page.querySelector("#vcsend").addEventListener("click", () => {
            koi.sendMessage(messageInput.value);
            messageInput.value = "";
        });

        this.module.page.parentNode.addEventListener("scroll", () => {
            this.checkJumpButton();
        });

    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    updateViewers() {
        if (this.viewersWindow) {
            this.viewersWindow.webContents.executeJavaScript("setViewers(" + JSON.stringify(this.module.viewersList) + ");");
        }
    }

    createWindow() {
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
                show: false,
                titleBarStyle: "shown",
                icon: __dirname + "/media/app_icon.png",
                frame: false,
                webPreferences: {
                    nodeIntegration: true
                }
            });

            this.viewersWindow.once("close", () => {
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

    messageUpvote(event) {
        let element = document.querySelector("[vc_message_id='" + event.id + "']");

        // Sometimes messages don't exist.
        if (element) {
            element.innerText = event.upvotes;

            if (event.upvotes >= 1000) {
                element.classList = "upvote-4";
            } else if (event.upvotes >= 100) {
                element.classList = "upvote-3";
            } else if (event.upvotes >= 10) {
                element.classList = "upvote-2";
            } else if (event.upvotes >= 1) {
                element.classList = "upvote-1";
            }
        }
    }

    addMessage(event) {
        let div = document.createElement("div");
        let username = document.createElement("span");
        let pfp = document.createElement("img");
        let text = document.createElement("span");

        let msg = document.createElement("li");
        let tooltip = document.createElement("ul");
        let counter = document.createElement("sup");

        pfp.src = event.sender.image_link;
        pfp.classList.add("vcprofile");
        pfp.addEventListener("click", () => {
            openLink(event.sender.link);
        });

        username.classList.add("vcusername");
        username.style = "color: " + event.sender.color + ";";
        username.appendChild(pfp);
        username.appendChild(document.createTextNode(event.sender.username));

        event.sender.badges.forEach((badge) => {
            let badgeIcon = document.createElement("img");

            badgeIcon.src = badge;
            badgeIcon.classList = "vcbadge";

            username.appendChild(badgeIcon);
        });

        username.appendChild(text);

        text.classList.add("vctext");

        event.message = this.escapeHtml(event.message);

        for (const [name, link] of Object.entries(event.emotes)) {
            event.message = event.message.split(name).join(`<img class="vcimage" title="${name}" src="${link}" />`);
        }

        text.innerHTML = event.message;

        counter.setAttribute("vc_message_id", event.id);

        div.classList.add("vcchatmessage");
        div.appendChild(username);

        div.appendChild(counter);

        if (event.donations) {
            if (isPlatform("CAFFEINE")) { // Caffeine has cute little prop images, so we display those instead of just the amount
                event.donations.forEach((donation) => {
                    const img = document.createElement("img");

                    img.src = donation.image;
                    img.classList = "vcimage";

                    username.appendChild(img);
                });
            } else {
                event.donations.forEach((donation) => {
                    const div = document.createElement("span");

                    div.innerHTML = donation.display;

                    username.appendChild(div);
                });
            }
        }

        msg.appendChild(div);

        if (isPlatform("CAFFEINE")) {
            let tooltipbtn = document.createElement("div");
            let upvotebtn = document.createElement("a");

            upvotebtn.innerHTML = `<ion-icon name="arrow-up"></ion-icon>`;
            upvotebtn.title = "Upvote";
            upvotebtn.addEventListener("click", () => {
                koi.upvote(event.id);
            });

            tooltipbtn.classList.add("tooltipbtn");
            tooltipbtn.appendChild(upvotebtn);

            tooltip.appendChild(tooltipbtn);
            tooltip.classList.add("tip");

            msg.appendChild(tooltip);
        }

        this.module.page.querySelector("#chatbox").appendChild(msg);

        this.tryJump();
    }


    addStatus(user, profilePic, color, type) {
        let div = document.createElement("div");
        let pfp = document.createElement("img");
        let username = document.createElement("span");
        let text = document.createElement("span");
        let msg = document.createElement("li");

        pfp.src = profilePic;
        pfp.classList.add("vcprofile");

        username.classList.add("vcusername");
        username.style = "color: " + color + ";";
        username.innerText = user;

        switch (type.toLowerCase()) {
            case "leave": text.innerText = "left the stream."; break;
            case "join": text.innerText = "joined the stream."; break;
            case "follow": text.innerText = "started following."; break;
        }

        div.classList.add("vcchatmessage");
        div.classList.add("vcstatus");
        div.appendChild(pfp);
        div.appendChild(username);
        div.appendChild(text);

        msg.appendChild(div);

        this.module.page.querySelector("#chatbox").appendChild(msg);

        this.tryJump();
    }

    isHidden() {
        return this.module.page.classList.contains("hide");
    }

    isAtBottom() {
        const scrollOffset = this.module.page.parentNode.scrollHeight - this.module.page.parentNode.scrollTop;
        const height = this.module.page.parentNode.offsetHeight;

        return (scrollOffset - height) < 100;
    }

    tryJump() {
        if (!this.isHidden()) {
            const jump = this.module.page.querySelector("#vcjumpdown");

            this.checkJumpButton();

            if (this.isAtBottom()) {
                this.jumpDown();
            }
        }
    }

    checkJumpButton() {
        if (!this.isHidden()) {
            const jump = this.module.page.querySelector("#vcjumpdown");

            if (this.isAtBottom()) {
                anime({
                    targets: jump,
                    easing: "linear",
                    opacity: 0,
                    duration: 100
                }).finished.then(() => {
                    jump.classList.add("hide");
                });
            } else {
                jump.classList.remove("hide");
                anime({
                    targets: jump,
                    easing: "linear",
                    opacity: 1,
                    duration: 100
                });
            }
        }
    }

    jumpDown() {
        if (!this.isHidden()) {
            this.module.page.parentNode.scrollTo(0, this.module.page.querySelector("#chatbox").scrollHeight + 1000);
        }
    }

};
