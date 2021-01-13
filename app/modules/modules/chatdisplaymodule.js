
MODULES.moduleClasses["casterlabs_chat_display"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat_display";
        this.displayname = "caffeinated.chatdisplay.title";
        this.type = "application";
        this.id = id;
        this.icon = "chatbox";

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

        this.contentDocument.querySelector("#vcopen").addEventListener("click", () => {
            this.createWindow();
        });

        this.contentDocument.querySelector("#vcjumpdown").addEventListener("click", () => {
            this.jumpDown();
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

        this.contentDocument.querySelector("#chatbox").addEventListener("scroll", () => {
            this.checkJumpButton();
        });

    }

    updateViewers() {
        if (this.viewersWindow) {
            this.viewersWindow.webContents.executeJavaScript("setViewers(" + JSON.stringify(this.viewersList) + ");");
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
        let element = this.contentDocument.querySelector("[vc_message_id='" + event.id + "']");

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
        const div = this.contentDocument.createElement("div");
        const username = this.contentDocument.createElement("span");
        const pfp = this.contentDocument.createElement("img");
        const text = this.contentDocument.createElement("span");

        const msg = this.contentDocument.createElement("li");
        const tooltip = this.contentDocument.createElement("ul");
        const counter = this.contentDocument.createElement("sup");

        pfp.src = event.sender.image_link;
        pfp.classList.add("vcprofile");
        pfp.addEventListener("click", () => {
            openLink(event.sender.link);
        });

        username.classList.add("vcusername");
        username.style = "color: " + event.sender.color + ";";
        username.appendChild(pfp);
        username.appendChild(this.contentDocument.createTextNode(event.sender.username));

        event.sender.badges.forEach((badge) => {
            const badgeIcon = this.contentDocument.createElement("img");

            badgeIcon.src = badge;
            badgeIcon.classList = "vcbadge";

            username.appendChild(badgeIcon);
        });

        username.appendChild(text);

        text.classList.add("vctext");

        event.message = escapeHtml(event.message);

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
                    const img = this.contentDocument.createElement("img");

                    img.src = donation.image;
                    img.classList = "vcimage";

                    username.appendChild(img);
                });
            } else {
                event.donations.forEach((donation) => {
                    const donationContainer = this.contentDocument.createElement("span");

                    donationContainer.innerHTML = formatCurrency(donation.amount, donation.currency);

                    username.appendChild(donationContainer);
                });
            }
        }

        msg.appendChild(div);

        if (isPlatform("CAFFEINE")) {
            if (event.id !== "") {
                const upvotetooltip = this.contentDocument.createElement("li");
                const upvotebtn = this.contentDocument.createElement("a");

                upvotebtn.innerHTML = `<ion-icon name="arrow-up"></ion-icon>`;
                upvotebtn.title = "Upvote";
                upvotebtn.addEventListener("click", () => {
                    koi.upvote(event.id);
                    upvotetooltip.remove();
                });

                upvotetooltip.appendChild(upvotebtn);
                upvotetooltip.classList.add("tooltipbtn");
                tooltip.appendChild(upvotetooltip);
            }
        }

        tooltip.classList.add("tip");
        msg.appendChild(tooltip);

        this.contentDocument.querySelector("#chatbox").appendChild(msg);

        this.tryJump();
    }


    addStatus(user, profilePic, color, type) {
        const div = this.contentDocument.createElement("div");
        const pfp = this.contentDocument.createElement("img");
        const username = this.contentDocument.createElement("span");
        const text = this.contentDocument.createElement("span");
        const msg = this.contentDocument.createElement("li");

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

        this.contentDocument.querySelector("#chatbox").appendChild(msg);

        this.tryJump();
    }

    isAtBottom() {
        const scrollOffset = this.contentDocument.querySelector("#chatbox").scrollHeight - this.contentDocument.querySelector("#chatbox").scrollTop;
        const height = this.contentDocument.querySelector("#chatbox").offsetHeight;

        return (scrollOffset - height) < 100;
    }

    tryJump() {
        this.checkJumpButton();

        if (this.isAtBottom()) {
            this.jumpDown();
        }
    }

    checkJumpButton() {
        const jump = this.contentDocument.querySelector("#vcjumpdown");

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

    jumpDown() {
        this.contentDocument.querySelector("#chatbox").scrollTo(0, this.contentDocument.querySelector("#chatbox").scrollHeight + 1000);
    }

};
