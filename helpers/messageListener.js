const { ipcMain } = require("electron");

module.exports = (window) => {
    ipcMain.on('PersonHasBeenAdded', () => {
        window.webContents.send('PersonHasBeenAdded');
    })
};