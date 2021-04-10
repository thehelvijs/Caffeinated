const vars = (() => {
    let vars = {};

    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value;
    });

    return vars;
})();

const contentScreenContainer = document.querySelector("#content");
const connectingScreenContainer = document.querySelector("#connecting");
let frame;

const ANIMATION_TIME = 200;

const UI = {

    showConnectingScreen() {
        connectingScreenContainer.classList.remove("hide");

        anime({
            targets: contentScreenContainer,
            easing: "linear",
            opacity: 0,
            duration: ANIMATION_TIME
        }).finished.then(() => {
            contentScreenContainer.classList.add("hide");
            contentScreenContainer.innerHTML = "";

            anime({
                targets: connectingScreenContainer,
                easing: "linear",
                opacity: 1,
                duration: ANIMATION_TIME
            });
        });
    },

    showContentScreen(html) {
        frame = document.createElement("iframe");

        contentScreenContainer.innerHTML = "";
        contentScreenContainer.appendChild(frame);

        // Inject us in.
        frame.contentWindow.conn = conn;

        frame.contentDocument.open();
        frame.contentDocument.write(html);
        frame.contentDocument.close();

        contentScreenContainer.classList.remove("hide");

        anime({
            targets: connectingScreenContainer,
            easing: "linear",
            opacity: 0,
            duration: ANIMATION_TIME
        }).finished.then(() => {
            connectingScreenContainer.classList.add("hide");

            anime({
                targets: contentScreenContainer,
                easing: "linear",
                opacity: 1,
                duration: ANIMATION_TIME
            });
        });
    }

};

class ConnectionUtil {
    constructor() {
        this.listeners = [];

        this.namespace = vars.namespace;
        this.id = vars.id;
        this.uuid = `${vars.namespace}:${vars.id}`;
        this.type = vars.type;

        const port = vars.port ? vars.port : 8091;
        const ip = vars.address ? vars.address : "http://localhost";

        // Give some time
        setTimeout(() => {
            this.socket = io(`${ip}:${port}`, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 1000,
                reconnectionAttempts: Number.MAX_SAFE_INTEGER
            });

            this.socket.on("init", () => {
                console.debug("Connected, sending init.")
                this.socket.emit("dock-uuid", {
                    uuid: this.uuid,
                    type: this.type
                });
            });

            this.socket.on("disconnect", () => {
                console.debug("Disconnected.")
                UI.showConnectingScreen();

                for (const listener of this.listeners) {
                    this.socket.off(listener);
                }

                this.listeners = [];
            });

            this.socket.on(`${this.uuid} html`, (html) => {
                UI.showContentScreen(html);
            });
        }, 600);
    }

    on(channel, callback) {
        channel = `${this.uuid} ${channel}`;

        this.listeners.push(channel);
        this.socket.on(channel, callback);
    }

    emit(channel, data) {
        channel = `${this.uuid} ${channel}`;

        this.socket.emit(channel, data);
    }

}