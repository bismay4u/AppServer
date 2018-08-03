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
    const _width = 955, _height = 600;
    var tempWindow = new BrowserWindow({
        width: _width,
        height: _height,
        center: true,
        minWidth: 955,
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

    //tempWindow.setMenu(null);
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
