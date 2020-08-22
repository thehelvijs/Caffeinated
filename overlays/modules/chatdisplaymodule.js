
MODULES.moduleClasses["casterlabs_chat_display"] = class {

    constructor(id) {
        this.namespace = "casterlabs_chat_display";
        this.type = "application";// settings";
        this.id = id;
        this.icon = "chatbox";
        this.displayname = "Chat";

        const instance = this;

        koi.addEventListener("chat", (event) => {
            instance.util.addMessage(event.sender.username, event.sender.image_link, event.sender.color, event.message, event.id);
        });

        koi.addEventListener("share", (event) => {
            instance.util.addMessage(event.sender.username, event.sender.image_link, event.sender.color, event.message, event.id);
        });

        koi.addEventListener("donation", (event) => {
            instance.util.addMessage(event.sender.username, event.sender.image_link, event.sender.color, event.message, event.id, event.image);
        });

        koi.addEventListener("follow", (event) => {
            instance.util.addStatus(event.follower.username, event.follower.image_link, event.follower.color, "follow");
        });

    }

    init() {
        this.page.innerHTML = `
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap" rel="stylesheet" />
        <style>
            #vcclear {
                position: absolute;
                right: 15px;
                top: 0px;
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
            }
        
            .vcimage {
                border-radius: 50%;
                object-fit: cover;
                max-height: 22px;
                max-width: 22px;
                padding-right: 5px;
                vertical-align: bottom;
                padding-bottom: 2px;
            }
        </style>
        <script src="https://unpkg.com/ionicons@5.1.2/dist/ionicons.js"></script>
        <div class="container verticalchatmodule">
            <div id="chatbox"></div>
            <button class="button" id="vcclear">
                Clear
            </button>
        </div>
        `.split("%id").join(this.id);

        this.util = new VerticalChatUtil(this);
    }

    /* getDataToStore() {
        return this.settings;
    }

    settingsDisplay = {
        refresh_token: "password"
    };

    defaultSettings = {
        refresh_token: ""
    }; */

};

class VerticalChatUtil {

    constructor(module) {
        this.module = module;

        this.module.page.querySelector("#vcclear").addEventListener("click", () => {
            module.page.querySelector("#chatbox").innerHTML = "";
        });
    }

    addMessage(sender, profilePic, color, message, id, imageLink) {
        let div = document.createElement("div");
        let username = document.createElement("span");
        let pfp = document.createElement("img");
        let text = document.createElement("span");

        pfp.src = profilePic;
        pfp.classList.add("vcimage");

        username.classList.add("vcusername");
        username.style = "color: " + color + ";";
        username.appendChild(pfp);
        username.appendChild(document.createTextNode(sender));
        username.appendChild(text);

        text.classList.add("vctext");
        text.innerText = message;

        div.classList.add("vcchatmessage");
        div.setAttribute("vc_message_id", id);
        div.appendChild(username);

        if (imageLink) {
            let image = document.createElement("img");

            image.classList.add("vcimage");
            image.src = imageLink;

            username.appendChild(image);
        }

        this.module.page.querySelector("#chatbox").appendChild(div);

        this.jumpbottom();
    }

    addStatus(user, profilePic, color, type) {
        let div = document.createElement("div");
        let pfp = document.createElement("img");
        let username = document.createElement("span");
        let text = document.createElement("span");

        pfp.src = profilePic;
        pfp.classList.add("vcimage");

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

        this.module.page.querySelector("#chatbox").appendChild(div);

        this.jumpbottom();
    }

    isHidden() {
        return this.module.page.classList.contains("hide");
    }

    isAtBottom() {
        return (this.module.page.parentNode.scrollHeight - this.module.page.parentNode.scrollTop) < 500;
    }

    jumpbottom() {
        if (!this.isHidden() && this.isAtBottom()) {
            this.module.page.parentNode.scrollTo(0, this.module.page.querySelector("#chatbox").scrollHeight + 1000);
        }
    }

};
