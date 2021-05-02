// Woopra Tracking
!function () { var a, b, c, d = window, e = document, f = arguments, g = "script", h = ["config", "track", "trackForm", "trackClick", "identify", "visit", "push", "call"], i = function () { var a, b = this, c = function (a) { b[a] = function () { return b._e.push([a].concat(Array.prototype.slice.call(arguments, 0))), b } }; for (b._e = [], a = 0; a < h.length; a++)c(h[a]) }; for (d.__woo = d.__woo || {}, a = 0; a < f.length; a++)d.__woo[f[a]] = d[f[a]] = d[f[a]] || new i; b = e.createElement(g), b.async = 1, b.src = "https://static.woopra.com/js/w.js", c = e.getElementsByTagName(g)[0], c.parentNode.insertBefore(b, c) }("woopra");

woopra.config({
    domain: "caffeinated.casterlabs.co",
    protocol: "https"
});

const ANALYTICS = (() => {
    let hasLoggedSignin = false;
    let hasTracked = false;

    let logSignin = false;

    return {
        async logSignin() {
            logSignin = true;
        },

        async logSignout() {
            woopra.track("signout", {});

            hasLoggedSignin = false;
            hasTracked = false;

            woopra.visitorData = {};
        },

        async logPuppetSignin() {
            woopra.track("puppet_signin", {});
        },

        async logPuppetSignout() {
            woopra.track("puppet_signout", {});
        },

        async logUserUpdate(userdata = CAFFEINATED.userdata) {
            const language = LANG.getTranslation("meta.language.name.native");
            const id = `${userdata.streamer.UUID};${userdata.streamer.platform}`;
            const platform = userdata.streamer.platform;
            const name = `${userdata.streamer.displayname} (${prettifyString(platform.toLowerCase())})`;

            woopra.identify({
                id: id,
                platform: platform,
                name: name,
                language: language
            });

            if (!hasTracked) {
                hasTracked = true;
                woopra.track();
            }

            if (logSignin) {
                logSignin = false;

                woopra.track("signin", {});
            }

            woopra.push();
        },

        async logEvent(event) {
            if (event && !event.isTest) {
                switch (event.event_type) {
                    case "STREAM_STATUS": {
                        if (CAFFEINATED.streamdata && (event.title != CAFFEINATED.streamdata)) {
                            woopra.track("stream_title_update", {
                                title: event.title
                            });
                        }

                        if (
                            // If there is existing stream data and it doesn't equal the previous state.
                            (CAFFEINATED.streamdata && (event.is_live != CAFFEINATED.streamdata.is_live)) ||
                            // OR if there isn't existing stream data and the person is live (We should log it.) 
                            (!CAFFEINATED.streamdata && event.is_live)
                        ) {
                            if (event.is_live) {
                                woopra.track("stream_online", {});
                            } else {
                                woopra.track("stream_offline", {});
                            }
                        }
                        break;
                    }
                }
            }
        }

    };
})();
