var appServer = null;
var serverIsConfigured = false;
var iPort = 0;
var sRootPath = '';
var rAutoindexPath = /^\/__dev\//;

function startServer(serverPort, docrootPath) {
    $(".onserveron").hide();

    if(serverPort==null || docrootPath==null) {
        return;
    }
    if(currentWindow.appServer!=null) {
        currentWindow.appServer.close()
    }
    docrootPath=docrootPath.replace("~",os.homedir());
    iPort = serverPort;
    sRootPath = docrootPath;
    
    finalURL = "http://localhost:" + serverPort+"/";
    $("#serverURL").attr("href",finalURL).html(finalURL);
    $(".onserveron").show();

    if($("#logHistory h1").length<=0) {
        $("#logHistory").html("<h1 align=center></h1>");
    }
    $("#logHistory h1").html("Visit the above URL for viewing the site");

    addHistory(docrootPath);
    launchFolderMonitor(docrootPath);
    
    express()
        .engine( "hbar", ehbars( { "extname": "hbar" } ) )
        .set( "view engine", "hbar" )
        .set( "views", __dirname + "/assets/views" )
        .use( autoIndexer )
        .use( serverLogging )
        .use( "/__dev", express.static( __dirname + "/assets/" ) )
        .use( express.static( docrootPath ) )
        .all( "*", function( oRequest, oResponse ) {
            var _ref, sExtension, sDirname;
            if( oRequest.url === "/favicon.ico" ) {
                return oResponse.status( 404 ).send( "404 Not found" );
            }
            if( oRequest.url.indexOf( "." ) > -1 ) {
                sExtension = ( _ref = oRequest.url.split( "." ) )[ _ref.length - 1 ];
                if( sExtension !== "html" && sExtension !== "htm" ) {
                    return oResponse.redirect( oRequest.url + ".html" );
                } else {
                    sDirname = fsPath.dirname( oRequest.url );
                    oResponse.status( 404 ).render( "404.hbar", {
                        "error": true,
                        //"files": parseFolder( fsPath.join( docrootPath, sDirname ) ),
                        "hasParent": sDirname !== "/",
                        "port": serverPort,
                        "root": docrootPath.replace( os.homedir(), "~" ),
                        "folder": sDirname,
                        "url": oRequest.url,
                        //"version": require( __dirname + "/../package.json" ).version
                        "version": APPCONFIG.VERSION
                    } );
                }
            } else {
                return oResponse.redirect( oRequest.url + ".html" );
            }
        })
        .listen( serverPort, function() {
            currentWindow.appServer = this;
            currentWindow.serverIsConfigured = true;
            $("#logHistory h1").detach();

            document.body.classList.add( "ready" );
        } );
}

function autoIndexer(oRequest, oResponse, fNext) {
    var sPath;
    if( oRequest.url.substr( -1 ) === "/" && $("#autoindex").is(":checked")) {
        sPath = fsPath.join( sRootPath, oRequest.url );
        if( fsUtils.existsSync( sPath + "/index.html" ) || fsUtils.existsSync( sPath + "/index.htm" ) ) {
            return fNext();
        }
        oResponse.render( "autoindex.hbar", {
            "files": parseFolder( sPath ),
            "hasParent": oRequest.url !== "/",
            "port": iPort,
            "root": sRootPath.replace( os.homedir(), "~" ),
            "folder": oRequest.url,
            //"version": require( __dirname + "/../package.json" ).version
            "version": APPCONFIG.VERSION
        } );
    } else {
        fNext();
    }
}

function parseFolder(sPath) {
    var aFiles = [];
    fsUtils.readdirSync( sPath ).forEach( function( sFile ) {
        var oFile, sMimeType;
        if( sFile.substr( 0, 1 ) !== "." ) {
            oFile = fsUtils.statSync( sPath + "/" + sFile );
            sMimeType = mimer( sFile );
            aFiles.push( {
                "isFolder": !!oFile.isDirectory(),
                "mime": !!oFile.isDirectory() ? "folder" : ( sMimeType ? sMimeType.split( "/" )[ 0 ] : "unknown" ),
                "name": sFile,
                "size": fsize( oFile.size ),
                "time": {
                    "raw": oFile.mtime,
                    "human": moment( oFile.mtime ).format( "YYYY-MM-DD HH:mm:SS" )
                }
            } );
        }
    } );
    return aFiles;
}

function serverLogging(oRequest, oResponse, fNext) {
    if( rAutoindexPath.test( oRequest.url ) || oRequest.url === "/favicon.ico" ) {
        return fNext();
    }
    var aLogLine = [ "<li>" ];
        aLogLine.push( "<time>" + ( ( new Date() ).toTimeString().split( " " )[ 0 ] ) + "</time>" );
        aLogLine.push( "<span>" + ( oRequest.method ) + "</span>" );
        aLogLine.push( "<strong>" + ( oRequest.url ) + "</strong>" );
        aLogLine.push( "</li>" );
    $("#logHistory").prepend(aLogLine.join( "" ));
    matchSearchCriteria($("#logHistory li:first-child"));
    $("#logHistory").scrollTop = $("#logHistory").scrollHeight;
    oRequest.connection.setTimeout( 2000 );
    fNext();
}

function launchFolderMonitor(sPath) {
    //console.log("Monitoring",sPath);
    fsUtils.watch(sPath,function (event, filename) {
        fileHashlink=filename.replace(".html","");
        console.log("MONITOR",filename,event);
        switch(event) {
            case "change":
                // if(appUI.CURRENT_PAGE==fileHashlink) {
                //     appUI.reloadPage();
                // } else {
                //     appUI.navigatePage(fileHashlink);
                // }
            break;
            case "rename":

            break;
            case "delete":

            break;
        }
    });
}