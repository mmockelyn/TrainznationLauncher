const electron          = require('electron')
const url               = require('url')
const path              = require('path')
const ejse              = require('ejs-electron')
const { autoUpdater }   = require('electron-updater')
const isDev             = require('electron-is-dev')
const log               = require('electron-log');
const swal              = require('sweetalert2')
const app               = electron.app
const BrowserWindow     = electron.BrowserWindow
const ipcMain           = electron.ipcMain

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let win

function sendStatusToWindow(text) {
    log.info(text);
  }

function createWindow() {
        win = new BrowserWindow({
        width: 1080,
        height: 768,
        icon: getPlatformIcon('Trainznation'),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        backgroundColor: "#171614"
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'app.ejs'),
        protocol: 'file:',
        slashes: true
    }))

    if(isDev){
        win.webContents.openDevTools()
    }

    win.removeMenu()
    win.setResizable(true)

    win.on('close', () => {
        win = null
    })
    return win
}

function getPlatformIcon(filename){
    const opSys = process.platform
    if (opSys === 'darwin') {
        filename = filename + '.icns'
    } else if (opSys === 'win32') {
        filename = filename + '.ico'
    } else {
        filename = filename + '.png'
    }

    return path.join(__dirname, 'app', 'assets', 'images', filename)
}


autoUpdater.on('checking-for-update', () => {
    swal.fire({
        type: 'info',
        text: "Recherche de mise à jour"
    })
    //sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
    swal.fire({
        type: 'info',
        text: "Mise à jour disponible"
    })
    //sendStatusToWindow('Update available.');
})

autoUpdater.on('update-not-available', (info) => {
    swal.fire({
        type: 'info',
        text: "Aucune mise à jour de disponible"
    })
    //sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
    swal.fire({
        type: 'info',
        text: "Mise à jour télécharger"
    })
    //sendStatusToWindow('Update downloaded');
});

app.on('ready', () => {
    autoUpdater.checkForUpdates();
    createWindow()
})

app.on('window-all-closed', () => {
    app.quit();
})
