const { remote } = require("electron");
const Store = require("electron-store");
const store = new Store();

let currWindow = remote.BrowserWindow.getFocusedWindow();

window.closeCurrentWindow = function () {
    currWindow.close();
}
