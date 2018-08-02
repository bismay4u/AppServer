function windowMaximize() {
    if(remote.getCurrentWindow().isMaximized()) {
        remote.getCurrentWindow().restore();
    } else {
        remote.getCurrentWindow().maximize();
    }
}

function windowFullScreen() {
    if(remote.getCurrentWindow().isFullScreen()) {
        remote.getCurrentWindow().setFullScreen(false);
    } else {
        remote.getCurrentWindow().setFullScreen(true);
    }
}

function closeApp() {
    remote.app.exit();
}
function reloadApp() {
    window.location.reload();
}

function appDebugger() {
    if(APPCONFIG.DEBUG!=true) return;

    //Page Change Watcher
    fsUtils.watch(__dirname+"/app/",function (event, filename) {
        fileHashlink=filename.replace(".html","");
        switch(event) {
            case "change":
                if(appUI.CURRENT_PAGE==fileHashlink) {
                    appUI.reloadPage();
                } else {
                    appUI.navigatePage(fileHashlink);
                }
            break;
            case "rename":

            break;
            case "delete":

            break;
        }
    });
}
function initLoggers() {
    logPath=getLogsPath();

    logger=new (winston.Logger)({
            level: 'verbose',
            transports: [
                new (winston.transports.Console)({ level: 'warn' }),
                new (winston.transports.File)({
                  name: 'info-file',
                  filename: fsPath.join(logPath,"info.log"),
                  level: 'info'
                }),
                new (winston.transports.File)({
                  name: 'warn-file',
                  filename: fsPath.join(logPath,"warning.log"),
                  level: 'warn'
                }),
                new (winston.transports.File)({
                  name: 'error-file',
                  filename: fsPath.join(logPath,"error.log"),
                  level: 'error'
                })
            ]
          });

    // console.debug=function(e) {
    //         logger.debug(e);//4
    //     }
    // console.log=function(e) {
    //         logger.verbose(e);//3
    //     }
    console.info=function(e) {
            logger.info(e);//2
        }
    console.warn=function(e) {
            logger.warn(e);//1
        }
    console.error=function(e) {
            logger.error(e);//0
        }
    
    console.info("Starting Application On "+moment(new Date()).format("Y-MM-d H:m:s"));
    console.info("Application Path "+fsPath.join(getAppPath(),"usermedia"));
}
