const {app, BrowserWindow, Menu, protocol, ipcMain} = require('electron');
const path = require('path');
const log = require('electron-log');
const isDev = require('electron-is-dev');

if ( isDev ) {
  require('electron-reload');
}

app.commandLine.appendSwitch('--ignore-gpu-blacklist', 'true');
log.info('App starting...');

let windows = [];
let win = null;


function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1080,
    height: 1920,
    resizable: false,
    movable: false,
    frame: false,
    kiosk: true,
    fullscreen: true,
    alwaysOnTop: false,
    webPreferences: {
      defaultEncoding: 'utf8',
      nodeIntegration: true
    }
  });

  win.webContents.on('dom-ready', function () {
    win.webContents.openDevTools();

    log.info('__dirname', __dirname);

    if ( isDev ) {
      // win.webContents.openDevTools();
    }
  });

  win.loadFile(path.join(__dirname, 'src/index.html'));

  win.on('closed', () => {
    win = null
  });
  windows.push(win);
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (windows === null) {
    // createWindow()
  }
});
