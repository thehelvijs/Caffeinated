
MODULES.moduleClasses["casterlabs_broadcast_image"] = class {

    constructor(id) {
        this.namespace = "casterlabs_broadcast_image";
        this.type = "settings";
        this.id = id;

        this.schedule = -1;

        const instance = this;

        this.defaultSettings.update = () => {
            if (this.settings.new_thumbnail.files.length > 0) {
                const form = new FormData();

                form.append("broadcast[game_image]", this.settings.new_thumbnail.files[0]);

                fetch("https://api.caffeine.tv/v1/users/" + CAFFEINE.credential.caid).then((response) => response.json()).then((user) => {
                    if (instance.schedule != -1) {
                        clearInterval(instance.schedule);
                        instance.schedule = -1;
                    }

                    let task = () => {
                        fetch("https://api.caffeine.tv/v1/broadcasts/" + user.user.broadcast_id, {
                            method: "PATCH",
                            headers: {
                                "Authorization": "Bearer " + CAFFEINE.credential.access_token
                            },
                            body: form
                        });
                    };

                    task();

                    instance.schedule = setInterval(task, (15 * 60) * 1000);
                });
            }
        };
    }

    settingsDisplay = {
        new_thumbnail: "file",
        update: "button"
    };

    defaultSettings = {
        new_thumbnail: "",
        // update: function() { }
    };

};
