function startProxyServer() {
    webURI = $("#folderPath").val();
    if(webURI.substr(0,7)=="http://" || webURI.substr(0,7)=="https://") {

    }
    startProxy($("#serverPort").val(), webURI);
}

function startProxy(serverPort, docURL) {
    $(".onserveron").hide();

    if(serverPort==null || docURL==null) {
        return;
    }
    if(currentWindow.appServer!=null) {
        currentWindow.appServer.close()
    }
    iPort = serverPort;
    webURL = docURL;

    window.document.title="AppServer : Proxy Running";

    finalURL = "http://localhost:" + serverPort+"/";
    $("#serverURL").attr("href",finalURL).html(finalURL);
    $(".onserveron").show();

    if($("#logHistory h1").length<=0) {
        $("#logHistory").html("<h1 align=center></h1>");
    }
    $("#logHistory h1").html("Visit the above URL for viewing the site");

    serverMode = 'proxy';

    addHistory(docURL);

    express()
        .use( proxyLogging )
        .use('/', proxy(docURL,{
            https: false,
            proxyReqPathResolver: function(req) {
                return require('url').parse(req.url).path;
            },
            userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
                // userRes.getHeaders();
                mime = userRes.getHeader('content-type');
                size = userRes.getHeader('content-length');
                //console.log(userReq.method,require('url').parse(userReq.url).path,userRes.statusCode,size);
        
                if(mime==null) {
                    return proxyResData;
                }
                mime=mime.split("/");
                mime=mime[0];
                
                if(mime=="text") {
                    return proxyResData.toString('utf8').replace(new RegExp(docURL,'g'),'/localhost:'+serverPort);
                } else {
                    return proxyResData;
                }
            },
            userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
                // recieves an Object of headers, returns an Object of headers.
                return headers;
            },
            // proxyErrorHandler: function(err, res, next) {
            //     next(err);
            // },
        }))
        .listen( serverPort, function() {
            currentWindow.appServer = this;
            currentWindow.serverIsConfigured = true;
            $("#logHistory h1").detach();

            document.body.classList.add( "ready" );
        } );
}

function proxyLogging(oRequest, oResponse, fNext) {
    //console.log(oRequest.method,urlManager.parse(oRequest.url).path,oResponse.statusCode);
    var aLogLine = [ "<li>" ];
        aLogLine.push( "<time>" + ( ( new Date() ).toTimeString().split( " " )[ 0 ] ) + "</time>" );
        aLogLine.push( "<span>" + ( oRequest.method ) + "</span>" );
        aLogLine.push( "<strong>" + ( oRequest.url ) + "</strong>" );
        aLogLine.push( "<i class='fa fa-eye pull-right openAsset actionCursor'></i>" );
        aLogLine.push( "</li>" );
    $("#logHistory").prepend(aLogLine.join( "" ));
    matchSearchCriteria($("#logHistory li:first-child"));
    $("#logHistory").scrollTop = $("#logHistory").scrollHeight;
    oRequest.connection.setTimeout( 2000 );
    
    fNext();
}