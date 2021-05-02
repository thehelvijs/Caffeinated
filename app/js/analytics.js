// Woopra Tracking
!function () { var a, b, c, d = window, e = document, f = arguments, g = "script", h = ["config", "track", "trackForm", "trackClick", "identify", "visit", "push", "call"], i = function () { var a, b = this, c = function (a) { b[a] = function () { return b._e.push([a].concat(Array.prototype.slice.call(arguments, 0))), b } }; for (b._e = [], a = 0; a < h.length; a++)c(h[a]) }; for (d.__woo = d.__woo || {}, a = 0; a < f.length; a++)d.__woo[f[a]] = d[f[a]] = d[f[a]] || new i; b = e.createElement(g), b.async = 1, b.src = "https://static.woopra.com/js/w.js", c = e.getElementsByTagName(g)[0], c.parentNode.insertBefore(b, c) }("woopra");

woopra.config({
    domain: "caffeinated.casterlabs.co",
    protocol: "https"
});

const ANALYTICS = (() => {
    let hasLoggedSignin = false;
    let hasTracked = false;

    return {
        async logSignin() {
            woopra.track("signin", {});
        },

        async logSignout() {
            woopra.track("signout", {});

            hasLoggedSignin = false;

            woopra.visitorData = {};
        },

        async logUserUpdate(userdata = CAFFEINATED.userdata) {
            const language = CAFFEINATED.store.get("language").split("-")[0];
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

            woopra.push();
        },

    };
})();
