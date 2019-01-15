const {app, BrowserWindow, Menu, protocol, ipcMain} = require('electron');
const electron = require('electron');
const path = require('path')
const url = require('url')
const log = require('electron-log')
const isDev = require('electron-is-dev');

if ( isDev ) {
  require('electron-reload');
}

//const {autoUpdater} = require('electron-updater')
//const cp = require('child_process')

//autoUpdater.logger = log;
//autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let windows = []

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

function createWindow() {
  win = new BrowserWindow({
    width: electron.screen.getPrimaryDisplay().size.width,
    height: electron.screen.getPrimaryDisplay().size.height,
    // x: 0,
    // y: 0,
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

  // win.webContents.openDevTools();

  win.loadFile(path.join(__dirname, 'src/index.html'));

  if ( isDev ) {
    win.webContents.openDevTools();
  }

  /*const firstLoader = (loadobj) => {
    win.loadURL(url.format(loadobj));
  }

  firstLoader({
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  })*/

  /* firstLoader({
    pathname: '//127.0.0.1:3000/mtcnn_face_recognition_webcam',
    protocol: 'http:',
    slashes: true
  }); */

  win.on('closed', () => {
    win = null
  })
  windows.push(win)
}

app.on('ready', () => {
  /* var workerProcess = cp.spawn('node', ['../face-api/examples/server.js'])
  workerProcess.stdout.on('data', () => {
    createWindow();
  }) */
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (windows === null) {
    // createWindow()
  }
})

// autoUpdater.on('checking-for-update', () => {
//   sendStatusToWindow('Checking for update...')
// })
// autoUpdater.on('update-available', (info) => {
//   sendStatusToWindow('Update available.')
// })
// autoUpdater.on('update-not-available', (info) => {
//   sendStatusToWindow('Update not available.')
// })
// autoUpdater.on('error', (err) => {
//   sendStatusToWindow('Error in auto-updater.');
// })
// autoUpdater.on('download-progress', (progressObj) => {
//   sendStatusToWindow('Download progress...');
// })

// autoUpdater.on('update-downloaded', (info) => {
//   sendStatusToWindow('Update downloaded')
//   autoUpdater.quitAndInstall();
// })

app.on('ready', function () {
  //autoUpdater.checkForUpdates();
})

