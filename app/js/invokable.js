class Invokable {

    constructor(transmissionHandler, id) {
        this.transmissionHandler = transmissionHandler;
        this.target = null;
        this.id = id;

        const instance = this;

        this.func = function (name, ...args) {
            instance.transmissionHandler({
                __meta: `invokable_js_${this.id}`,
                type: "func",
                field: name,
                args: args
            });
        }
    }

    trigger(data) {
        if (this.target && (data.__meta == `invokable_js_${this.id}`)) {
            try {
                if (data.type == "data") {
                    this.target[data.field] = data.value;
                } else if (data.type == "func") {
                    this.target[data.field](...data.args);
                }
            } catch (e) {
                console.error(e);
            }

            return true;
        }

        return false;
    }

    transmit(name, ...data) {
        this.transmissionHandler({
            __meta: `invokable_js_${this.id}`,
            type: "data",
            field: name,
            value: data
        });
    }

    callFunc(name, ...args) {
        this.transmissionHandler({
            __meta: `invokable_js_${this.id}`,
            type: "func",
            field: name,
            args: args
        });
    }

    funcs(...names) {
        const instance = this;
        let result = {};

        for (const name of names) {
            result[name] = function () {
                instance.func(name, ...arguments)
            };
        }

        return result;
    }

}
