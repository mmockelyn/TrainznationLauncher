const electron          = require('electron')
const url               = require('url')
const path              = require('path')
const ejse              = require('ejs-electron')
const { autoUpdater }   = require('electron-updater')
const isDev             = require('electron-is-dev')
const app               = electron.app
const BrowserWindow     = electron.BrowserWindow
const ipcMain           = electron.ipcMain


function createWindow() {
    let win = new BrowserWindow({
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

app.on('ready', createWindow, autoUpdater.checkForUpdatesAndNotify())


autoUpdater.on ('update-available', () => { 
    win.webContents.send ('update_available'); 
  }); 

  autoUpdater.on ('update-download', () => { 
    win.webContents.send ('update_downloaded'); 
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });