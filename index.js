const electron          = require('electron')
const url               = require('url')
const path              = require('path')
const ejse              = require('ejs-electron')
const { autoUpdater }   = require('electron-updater')
const app               = electron.app
const BrowserWindow     = electron.BrowserWindow

autoUpdater.checkForUpdatesAndNotify()

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

    win.webContents.openDevTools()

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

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    // Sur macOS, il est commun pour une application et leur barre de menu
    // de rester active tant que l'utilisateur ne quitte pas explicitement avec Cmd + Q
    if (process.platform !== 'darwin' && this.isMenuBarAutoHide() && this.isMenuBarVisible()) { 
        app.quit()
    }
})