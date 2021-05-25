let currentZIndex = 0;

class Draggable {
    #element = null;
    #parent = null;
    #eventListeners = {};
    #posX = {};
    #posY = {};
    enabled = false;

    constructor(element, options = {}) {
        const {
            limit = true,

            posX = 0,
            posY = 0,

            width = .05,
            height = .05,

            minWidth = .01,
            minHeight = .01,

            maxWidth = 1,
            maxHeight = 1,

            zIndex = 100
        } = options;

        this.#posX = posX;
        this.#posY = posY;

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let mouseX = this.#posX;
        let mouseY = this.#posY;

        this.#element = element;
        this.#parent = this.#element.parentElement;

        // Set the styles
        {
            this.#element.style.width = `${width * 100}%`;
            this.#element.style.height = `${height * 100}%`;

            this.#element.style.minWidth = `${minWidth * 100}%`;
            this.#element.style.minHeight = `${minHeight * 100}%`;

            this.#element.style.maxWidth = `${maxWidth * 100}%`;
            this.#element.style.maxHeight = `${maxHeight * 100}%`;

            this.#element.style.zIndex = zIndex;
            this.#element.style.cursor = "move";
        }

        new ResizeObserver((e) => {
            this.#update();
            this.#broadcast("resize");
        }).observe(this.#element);

        this.#element.addEventListener("mousedown", (e) => {
            if (this.enabled && !e.shiftKey) {
                e.preventDefault();

                dragging = true;

                startX = e.clientX;
                startY = e.clientY;

                this.setZ(currentZIndex++);
            }
        });

        document.addEventListener("mousemove", (e) => {
            if (dragging) {
                const parentWidth = this.#parent.offsetWidth;
                const parentHeight = this.#parent.offsetHeight;

                mouseX -= (startX - e.clientX) / parentWidth;
                mouseY -= (startY - e.clientY) / parentHeight;

                if (limit) {
                    const maxX = (parentWidth - this.#element.offsetWidth) / parentWidth;
                    const maxY = (parentHeight - this.#element.offsetHeight) / parentHeight;

                    if (mouseX > maxX) {
                        this.#posX = maxX;
                    } else if (mouseX < 0) {
                        this.#posX = 0;
                    } else {
                        this.#posX = mouseX;
                    }

                    if (mouseY > maxY) {
                        this.#posY = maxY;
                    } else if (mouseY < 0) {
                        this.#posY = 0;
                    } else {
                        this.#posY = mouseY;
                    }
                } else {
                    this.#posX = mouseX;
                    this.#posY = mouseY;
                }

                startX = e.clientX;
                startY = e.clientY;

                this.#update();
                this.#broadcast("move");
            }
        }, false);

        document.addEventListener("mouseup", () => {
            dragging = false;
        });

        this.#update()
    }

    on(type, listener) {
        const arr = this.#eventListeners[type.toLowerCase()] ?? [];

        arr.push(listener);

        this.#eventListeners[type.toLowerCase()] = arr;
    }

    #broadcast(type) {
        const listeners = this.#eventListeners[type.toLowerCase()];

        if (listeners) {
            listeners.forEach((listener) => {
                try {
                    listener(this);
                } catch (e) {
                    console.error("An event listener produced an exception: ");
                    console.error(e);
                }
            });
        }
    }

    #update() {
        // These may seem flipped, but it's intentional.
        {
            this.#element.style.top = (this.#posY * 100) + "%";
            this.#element.style.left = (this.#posX * 100) + "%";
        }

        // Do this so it will always match the container dimensions properly.
        {
            const [width, height] = this.getSize();

            this.#element.style.width = `${width * 100}%`;
            this.#element.style.height = `${height * 100}%`;
        }

        this.#broadcast("update");
    }

    getElement() {
        return this.#element;
    }

    getPosition() {
        return [this.#posX, this.#posY];
    }

    setPosition(posX, posY) {
        this.#posX = posX;
        this.#posY = posY;

        this.#update();
    }

    getSize() {
        let width = this.#element.style.width;

        if (width.endsWith("%")) {
            width = parseFloat(width.substring(0, width.length - 1)) / 100;
        } else {
            const parentWidth = this.#parent.offsetWidth;

            width = parseFloat(width.substring(0, width.length - 2)); // px

            width = (width / parentWidth);
        }

        let height = this.#element.style.height;

        if (height.endsWith("%")) {
            height = parseFloat(height.substring(0, height.length - 1)) / 100;
        } else {
            const parentHeight = this.#parent.offsetHeight;

            height = parseFloat(height.substring(0, height.length - 2)); // px

            height = (height / parentHeight);
        }

        return [width, height];
    }

    setSize(width, height) {
        this.#element.style.width = `${width * 100}%`;
        this.#element.style.height = `${height * 100}%`;

        this.#update();
    }

    getZ() {
        return parseFloat(this.#element.style.zIndex);
    }

    setZ(z) {
        this.#element.style.zIndex = z;
    }

}

document.addEventListener("keydown", (e) => {
    if (e.key == "Shift") {
        Array.from(document.querySelectorAll(".draggable"))
            .forEach((elem) => {
                elem.style.cursor = "auto";
                elem.style.resize = "both";
            });
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key == "Shift") {
        Array.from(document.querySelectorAll(".draggable"))
            .forEach((elem) => {
                elem.style.cursor = "move";
                elem.style.resize = "none";
            });
    }
});

window.parent?.addEventListener("keydown", (e) => {
    if (e.key == "Shift") {
        Array.from(document.querySelectorAll(".draggable"))
            .forEach((elem) => {
                elem.style.cursor = "auto";
                elem.style.resize = "both";
            });
    }
});

window.parent?.addEventListener("keyup", (e) => {
    if (e.key == "Shift") {
        Array.from(document.querySelectorAll(".draggable"))
            .forEach((elem) => {
                elem.style.cursor = "move";
                elem.style.resize = "none";
            });
    }
});

// export default Draggable;
