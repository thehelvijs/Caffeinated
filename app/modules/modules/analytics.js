MODULES.moduleClasses["casterlabs_analytics"] = class {

    constructor(id) {
        this.namespace = "casterlabs_analytics";
        this.type = "application";
        this.displayname = "caffeinated.analytics.title";
        this.id = id;
        this.pageSrc = __dirname + "/modules/modules/analytics.html";

        this.handle = "analytics";

        this.user = undefined;
        this.platform = "UNKNOWN_PLATFORM";

        this.supported_platforms = ["CAFFEINE", "TWITCH"];
        this.engagements = ["chat", "donation", "upvote", "follow", "viewer_list"];

        this.last_status = undefined;
        this.live = false;
    }

    init() {
        koi.addEventListener("user_update", (event) => {
            // Update user
            this.updateUser(event);

            // Check if platform is supported
            this.platform = CAFFEINATED.userdata.streamer.platform;
            if (!this.isValidPlatform(this.platform)) {
                this.page.innerHTML = `
                </br>
                <h5 style="text-align:center">
                    ${this.platform} currently is not supported for analytics, we are working on it! 🙂 </br></br>
                    Join our <a onclick="openLink('https:\/\/discord.com/invite/qq8nkGw')">Discord</a> to stay up to date!
                </h5>
                `;
            }
        });

        koi.addEventListener("stream_status", (event) => {
            if (this.isValidPlatform(this.platform)) {
                this.live = event.is_live;
                this.statusChecker(event);
            }
        });

        // Add listeners to all engagement types (only active when stream is live)
        this.engagements.forEach(type => {
            koi.addEventListener(type, (event) => {
                if (this.live && this.isValidPlatform(this.platform)) {
                    this.addEngagement(type, event);
                }
            });
        });
    }

    isValidPlatform(platform) {
        return this.supported_platforms.includes(platform);
    }

    statusChecker(event) {
        let live = this.live;

        if (!event.isTest && event != undefined) {
            // Started/stopped stream
            // (TODO) emit this for other modules (start/stop)
            if (live != this.last_status) {
                if (live) {
                    // Stream started
                    this.resetStats();
                    this.stream.start = this.timestamp();

                } else if (!live && this.last_status != undefined) {
                    // Stream ended
                    this.stream.duration = this.timestamp() - this.stream.start;

                    CAFFEINATED.store.set(`${this.handle}.${this.user}.${this.date()}.${this.stream.start}`, this.stream);

                    // update graphs
                }
                this.last_status = live;
            }

            // Update info during stream
            if (live) {
                this.stream.title = event.title;
                // (TODO) game_name
            }
        }
    }

    resetStats() {
        this.stream = {
            "title": undefined,
            "start": undefined,
            "duration": undefined,
            "engagement": {}
        };
        this.engagements.forEach(type => { 
            this.stream.engagement[type] = {}
        });
    }

    addEngagement(type, event) {
        let engagement = this.stream.engagement[type];

        switch (type) {
            case "viewer_list": {
                // peak viewers
                // total unique viewers
                break;
            }
            case "donation": {
                // donated amount
                // top donator
                break;
            }
            case "chat": {
                // most active
                // total
                break;
            }
            default: {
                let total = engagement["total"];
                if (total == null || total == 0 || total == undefined) {
                    engagement["total"] = 1;
                } else {
                    engagement["total"] += 1;
                }
            }
        }
    }

    updateUser(event) {
        // username/displayname?
        this.user = event.streamer.UPID;
    }

    // Timestamp with offset
    timestamp() {
        let date = new Date();
        return (date.getTime() + ((-1) * date.getTimezoneOffset() * 60000));
    }

    date() {
        let today = new Date();
        let month = String(today.getMonth() + 1);
        month = "0".repeat(2 - month.length) + month;
        let day = String(today.getDate());
        day = "0".repeat(2 - day.length) + day;
        let date = today.getFullYear() + '-' + month + '-' + day;
        return (date);
    }
};
