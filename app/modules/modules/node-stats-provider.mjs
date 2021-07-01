// This file is used by app/modules/modules/stats.mjs
const fs = require("fs");

const STATS_DIR = `${require("electron").remote.app.getPath("userData")}/stream_stats`;

function readJsonFile(file) {
    const data = fs.readFileSync(file);

    return JSON.parse(data);
}

function writeJsonFile(file, contents) {
    try {
        const data = JSON.stringify(contents);

        fs.writeFileSync(file, data);
    } catch (e) {
        console.error("[NodeStatsProvider]", "Could not write stats file:", e);
    }
}

const STAT_TYPES = [
    // "AVERAGE_VIEWERS",
    "MAX_VIEWERS",
    "TOTAL_VIEWERS",
    "NEW_VIEWERS",
    // "WATCH_TIME",
    "REVENUE",
    // "STREAM_TIME",
    "SUBSCRIBERS",
    "FOLLOWERS",
    "UNIQUE_CHATTERS",
    "TOTAL_CHAT_MESSAGES"
];

class NodeStatsProvider {
    currentStreamStats = null;
    statsMeta = null;

    constructor(channelId, platform) {
        this.channelId = channelId;
        this.platform = platform;

        try {
            fs.mkdirSync(this.getFilePath(), { recursive: true });
        } catch (e) {
            console.log(e)
        }

        console.debug("[NodeStatsProvider]", "Current stats dir:", this.getFilePath());

        try {
            const meta = readJsonFile(this.getFilePath("meta.json"));

            this.statsMeta = {
                knownViewers: new Set(meta.knownViewers)
            };
        } catch (e) {
            this.statsMeta = {
                knownViewers: new Set()
            };
            this.save();
        }
    }

    shutDown() {
        this.currentStreamStats.finished = true;
        this.save();
    }

    save() {
        if (this.currentStreamStats) {
            const stats = this.getCurrentStatsData();

            writeJsonFile(`streams/${this.currentStreamStats.timestamp}.json`, stats);
        }

        const meta = {
            knownViewers: Array.from(this.statsMeta.knownViewers)
        };

        writeJsonFile(`meta.json`, meta);

        if (this.currentStreamStats.finished) {
            for (const interval of this.currentStreamStats.intervals) {
                clearInterval(interval);
            }

            this.currentStreamStats = null;
        }
    }

    getCurrentStatsData() {
        let averageViewers = 0;

        // Calculate average viewer count.
        for (const avg of this.currentStreamStats.stats.AVERAGE_VIEWERS) {
            averageViewers += avg;
        }

        averageViewers /= this.currentStreamStats.stats.AVERAGE_VIEWERS.length;

        // STAT_TYPES
        return {
            // Add *most* values from here.
            ...this.currentStreamStats.stats,

            // Manually assign some.
            AVERAGE_VIEWERS: averageViewers,
            TOTAL_VIEWERS: Object.entries(this.currentStreamStats.stats.TOTAL_VIEWERS.size).length,
            STREAM_TIME: Date.now() - this.currentStreamStats.timestamp,
            WATCH_TIME: 0, // TODO
            UNIQUE_CHATTERS: this.currentStreamStats.stats.UNIQUE_CHATTERS.size
        };
    }

    async onEvent(event) {
        if (event.type == "STREAM_UPDATE") {
            // Init the stream stats
            if (event.is_live && !this.currentStreamStats) {
                this.currentStreamStats = {
                    finished: false,
                    timestamp: Date.now(),
                    stats: {
                        // STAT_TYPES
                        AVERAGE_VIEWERS: [],
                        MAX_VIEWERS: 0,
                        TOTAL_VIEWERS: {}, // Will be used to track watch time
                        NEW_VIEWERS: 0,
                        WATCH_TIME: 0, // TODO
                        REVENUE: [],
                        STREAM_TIME: 0,
                        SUBSCRIBERS: 0,
                        FOLLOWERS: 0,
                        UNIQUE_CHATTERS: new Set(),
                        TOTAL_CHAT_MESSAGES: 0
                    },
                    viewerCount: 0,
                    intervals: []
                };

                setInterval(() => {
                    this.currentStreamStats.stats.AVERAGE_VIEWERS.push(this.currentStreamStats.viewerCount);
                }, 5000);

                this.save();
            } else if (!event.is_live && this.currentStreamStats) {
                this.currentStreamStats.finished = true;
                this.save();
            }
        } else if (this.currentStreamStats) {
            switch (event.type) {

                case "VIEWER_JOIN": {
                    // Viewer tracking
                    {
                        const viewerData = this.currentStreamStats.stats.TOTAL_VIEWERS[event.viewer.id] ?? {
                            viewer: event.viewer,
                            events: []
                        };

                        viewerData.events.push({
                            type: "JOIN",
                            timestamp: Date.now()
                        });

                        this.currentStreamStats.stats.TOTAL_VIEWERS[event.viewer.id] = viewerData;
                    }

                    // New Viewers
                    if (!this.statsMeta.knownViewers.has(event.viewer.id)) {
                        this.statsMeta.knownViewers.add(event.viewer.id);
                        this.currentStreamStats.stats.NEW_VIEWERS++;
                    }
                    break;
                }

                case "VIEWER_LEAVE": {
                    const viewerData = this.currentStreamStats.stats.TOTAL_VIEWERS[event.viewer.id] ?? {
                        viewer: event.viewer,
                        events: []
                    };

                    viewerData.events.push({
                        type: "LEAVE",
                        timestamp: Date.now()
                    });

                    this.currentStreamStats.stats.TOTAL_VIEWERS[event.viewer.id] = viewerData;
                    break;
                }

                case "VIEWER_LIST": {
                    this.currentStreamStats.viewerCount = event.viewers.length;

                    const max = this.currentStreamStats.stats.MAX_VIEWERS;

                    if (event.viewers.length > max) {
                        this.currentStreamStats.stats.MAX_VIEWERS = event.viewers.length;
                        this.save();
                    }
                    return;
                }

                case "USER_UPDATE": {
                    this.currentStreamStats.stats.SUBSCRIBERS =
                        (event.streamer.subscriber_count == -1) ? 0 : event.streamer.subscriber_count;

                    this.currentStreamStats.stats.FOLLOWERS = event.streamer.followers_count;
                    break;
                }

                case "DONATION": {
                    this.currentStreamStats.stats.REVENUE.push(event);
                    break;
                }

                case "CHAT": {
                    this.currentStreamStats.stats.TOTAL_CHAT_MESSAGES++;
                    break;
                }

            }

            this.save();
        }
    }

    getFilePath(filename = "") {
        return `${STATS_DIR}/${this.platform}/${this.channelId}/${filename}`;
    }

}

export default NodeStatsProvider;