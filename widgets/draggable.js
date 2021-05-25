let currentZIndex = 0;

class Draggable {

    constructor(element) {
        this.element = element;
        this.parent = this.element.parentElement;

    }

    update() {
        // These may seem flipped, but it's intentional.
        {
            this.element.style.top = (this.posY * 100) + "%";
            this.element.style.left = (this.posX * 100) + "%";
        }

        // Do this so it will always match the container dimensions properly.
        {
            const [width, height] = this.getSize();

            this.element.style.width = `${width * 100}%`;
            this.element.style.height = `${height * 100}%`;
        }
    }

    getElement() {
        return this.element;
    }

    getPosition() {
        return [this.posX, this.posY];
    }

    setPosition(posX, posY) {
        this.posX = posX;
        this.posY = posY;

        this.update();
    }

    getSize() {
        let width = this.element.style.width;

        if (width.endsWith("%")) {
            width = parseFloat(width.substring(0, width.length - 1)) / 100;
        } else {
            const parentWidth = this.parent.offsetWidth;

            width = parseFloat(width.substring(0, width.length - 2)); // px

            width = (width / parentWidth);
        }

        let height = this.element.style.height;

        if (height.endsWith("%")) {
            height = parseFloat(height.substring(0, height.length - 1)) / 100;
        } else {
            const parentHeight = this.parent.offsetHeight;

            height = parseFloat(height.substring(0, height.length - 2)); // px

            height = (height / parentHeight);
        }

        return [width, height];
    }

    setSize(width, height) {
        this.element.style.width = `${width * 100}%`;
        this.element.style.height = `${height * 100}%`;

        this.update();
    }

    getZ() {
        return parseFloat(this.element.style.zIndex);
    }

    setZ(z) {
        this.element.style.zIndex = z;
    }

}
