class RepoManager {
    constructor() {
        this.repos = [];
        this.elements = [];
    }

    async addRepo(repo) {
        try {
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

                if (Array.isArray(modules.scripts)) {
                    for (let src of modules.scripts) {
                        let script = document.createElement("script");

                        script.src = repo + "/" + src;
                        script.setAttribute("repo", modules.name);

                        this.elements.push(script);
                        document.querySelector("#scripts").appendChild(script);
                        await RepoUtil.waitForScriptToLoad(script);
                    }
                }

                if (Array.isArray(modules.external)) {
                    for (let external of modules.external) {
                        let script = document.createElement("script");

                        script.src = external;
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
                            let module = new MODULES.moduleClasses[instance.namespace](instance.id, repo);

                            await MODULES.initalizeModule(module);

                            module.persist = true;
                        }
                    }
                }

                if (Array.isArray(modules.simple)) {
                    for (let instance of modules.simple) {
                        let loaded = await MODULES.getFromUUID(instance.namespace + ":" + instance.id);

                        if (!loaded) {
                            await MODULES.initalizeModule(new MODULES.moduleClasses[instance.namespace](instance.id, repo));
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
    matchToRegex(str) {
        return new RegExp("(" + str.replace(/[\.]/g, "\\.").replace(/[\*]/g, ".*") + ")", "g");
    },

    waitForScriptToLoad(script) {
        return new Promise((resolve) => {
            script.addEventListener("load", () => resolve());
        });
    },

    isSupported(supported = [], unsupported = []) {
        if (Array.isArray(unsupported)) {
            for (let version of unsupported) {
                if (VERSION.match(RepoUtil.matchToRegex(version))) {
                    return false;
                }
            }
        }

        if (Array.isArray(supported)) {
            for (let version of supported) {
                if (VERSION.match(RepoUtil.matchToRegex(version))) {
                    return true;
                }
            }
        }

        return false;
    }
}
