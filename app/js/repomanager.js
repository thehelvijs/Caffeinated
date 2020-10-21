class RepoManager {
    constructor() {
        this.repos = [];
        this.elements = [];
    }

    async addRepo(repo, useVersionedRepo = true) {
        try {
            if (useVersionedRepo) {
                repo = await RepoUtil.getRepoUrl(repo);
            }

            let modules = await (await fetch(repo + "/modules.json")).json();

            if (RepoUtil.isSupported(modules.supported, modules.unsupported)) {
                if (Array.isArray(modules.preload)) {
                    for (let required of modules.preload) {
                        if (required.endsWith("/")) {
                            required = required.substring(required, required.length - 1);
                        }
                        console.log("Repo " + repo + " requires the following repo " + required + ", loading it now.");
                        await this.addRepo(required, false);
                    }
                }

                if (Array.isArray(modules.overlays)) {
                    for (let overlay of modules.overlays) {
                        let script = document.createElement("script");

                        script.src = repo + "/" + overlay;
                        script.setAttribute("repo", modules.name);

                        this.elements.push(script);
                        document.querySelector("#scripts").appendChild(script);
                        await RepoUtil.waitForScriptToLoad(script);
                    }
                }

                if (Array.isArray(modules.required)) {
                    for (let instance of modules.required) {
                        let loaded = await MODULES.getFromUUID(instance.namespace + ":" + instance.id);

                        if (!loaded) {
                            MODULES.initalizeModule(new MODULES.moduleClasses[instance.namespace](instance.id));
                        }
                    }
                }

                this.repos.push(modules);
            } else {
                throw "Repo " + repo + " doesn't support the current version of caffeinated";
            }
        } catch (e) {
            console.error(e);
            throw "Unable to retrieve modules from " + repo;
        };
    }

}

const RepoUtil = {
    versionToRegex(version) {
        return new RegExp("(" + version.replace(/[\.]/g, "\\.").replace(/[\*]/g, ".*") + ")", "g");
    },

    getRepoUrl(base) {
        return new Promise((resolve) => {
            let versioned = base + "/" + VERSION.split("-")[0];

            fetch(versioned + "/modules.json").then((response) => {
                if (response.ok) {
                    resolve(versioned);
                } else {
                    console.warn("Repo: " + base + " does not support versioned urls, using root.");
                    resolve(base);
                }
            }).catch(() => {
                console.warn("Repo: " + base + " does not support versioned urls, using root.");
                resolve(base);
            });;
        });
    },

    waitForScriptToLoad(script) {
        return new Promise((resolve) => {
            script.addEventListener("load", () => resolve());
        });
    },

    isSupported(supported = [], unsupported = []) {
        if (Array.isArray(unsupported)) {
            for (let version of unsupported) {
                if (VERSION.match(RepoUtil.versionToRegex(version))) {
                    return false;
                }
            }
        }

        if (Array.isArray(supported)) {
            for (let version of supported) {
                if (VERSION.match(RepoUtil.versionToRegex(version))) {
                    return true;
                }
            }
        }

        return false;
    }
}
