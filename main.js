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

let mainWindow;
var windowsList={};

function createWindow() {
    const _width = 1024, _height = 768;
    mainWindow = new BrowserWindow({
        width: _width,
        height: _height,
        minWidth: '',
        minHeight: '',
        maxWidth: '',
        maxHeight: '',
        minimizable: true,
        maximizable: true,
        resizable: true,
        icon: './icon.png',
        'node-integration': false
    })

    try{
        const screenSize = electron.screen.getPrimaryDisplay().size;
        mainWindow.setPosition( (screenSize.width  - _width )  / 2,
                        ((screenSize.height - _height ) / 2))
    } catch(er) {
        mainWindow.center()
    }

    mainWindow.setMenu(null);
    // mainWindow.openDevTools();

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      }));

    mainWindow.on("closed", () => {12
      mainWindow = null
    });

    windowsList['MAIN']=mainWindow;
}

global.getMainWindow = function() {
    return mainWindow;
}

global.openNewWindow = function(uri,windowTitle,windowID) {
    if(windowID==null) windowID="webviewer";
    if(windowTitle==null) windowTitle="New Window";

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
        icon: './icon.png',
        'node-integration': false
    })
    winViewer.setTitle(windowTitle);
    winViewer.center()

    winViewer.setMenu(null);
    // winViewer.openDevTools();

    if(uri.indexOf("http://")===0 || uri.indexOf("https://")===0) {
       winViewer.loadURL(uri); 
    } else {
        winViewer.loadURL(url.format({
                pathname: path.join(__dirname, "app/pages/"+uri+".html"),
                protocol: 'file:',
                slashes: true
              }));
    }

    winViewer.on("closed", () => {
      winViewer = null;
      delete windowsList[windowID];
    })

    windowsList[windowID]=winViewer;
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
})
