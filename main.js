const {
    app,
    BrowserWindow,
    ipcMain,
    shell
} = require('electron')

//const electron = require('electron')
//const {shell} = require('electron')
//const app = electron.app
//const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const hashMD5 = require('md5');

let mainWindow;
var windowsList=[];

global.createWindow = function() {
    var _width = 1000, _height = 600;
    var tempWindow = new BrowserWindow({
        width: _width,
        height: _height,
        center: true,
        minWidth: 1000,
        minHeight: 400,
        maxWidth: '',
        maxHeight: '',
        minimizable: true,
        maximizable: true,
        resizable: true,
        show: false,
        'standard-window': false,
        icon: './icon.png',
        'node-integration': false,
    })

    tempWindow.center();

    tempWindow.setMenu(null);
    //tempWindow.openDevTools();

    tempWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      }));
    
    if(windowsList.length<=0) {
        mainWindow=tempWindow;
        
        windowsList.push(mainWindow);
        
        mainWindow.on("closed", () => {
            mainWindow = null
          });
    } else {
        windowsList.push(tempWindow);
    }
}

global.openPreviewer = function(uri,windowTitle) {
    const _width = 1100, _height = 700
    winViewer = new BrowserWindow({
        title: windowTitle,
        width: _width,
        height: _height,
        minWidth: '',
        minHeight: '',
        maxWidth: '',
        maxHeight: '',
        minimizable: true,
        maximizable: false,
        resizable: false,
        skipTaskbar: false,
        // fullscreen: true,
        // kiosk: true,
        parent: mainWindow,
        // frame: false,
        // titleBarStyle: 'hidden',
        icon: './app/images/logos/logo.png',
        'node-integration': false
    })
    winViewer.setTitle(windowTitle);
    winViewer.center()

    winViewer.setMenu(null);
    // winViewer.openDevTools();

    winViewer.loadURL(uri); 
}

global.getMainWindow = function() {
    return mainWindow;
}

app.on("ready", global.createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on("activate", () => {
    if (mainWindow === null) {
        global.createWindow();
    }
})
