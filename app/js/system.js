var searchEnabled = false;

function initWindow() {
    switch (os.platform())  {
        case "win32":
        case "win64":
            document.body.classList.add("windows");
            break;

        default:
            document.body.classList.add(os.platform());
            break;
    }

    $("#serverIsProxy").change(function() {
        toggleFieldForServerType();
    });

    $("#logHistory").delegate(".openAsset", "click", function() {
        path=$(this).closest("li").find("strong").text();
        URI=finalURL.substr(0,finalURL.length-1)+path;

        remote.getGlobal("openPreviewer")(URI,"Preview Asset !");
        //shell.openExternal(URI);
        // if($("#serverIsProxy").is(":checked")) {
        // } else {
        // }
    });

    $("body").delegate("a.external[href]", "click", function (e) {
        href = $(this).attr("href");
        if (href != null && href.length > 3) {
            shell.openExternal(href);
        } else {
            console.log("Link Invalid");
        }
    });
    $("#dirHistory").delegate(".list-group-item","click", function(e) {
        e.preventDefault();
        dir=$(this).data("dir");
        type=$(this).data("type");
        if(type=="proxy") {
            $("#serverIsProxy")[0].checked=true;
            $("#serverIsProxy").trigger("change");
            $("#folderPath").val(dir);
            startProxyServer();
        } else {
            $("#serverIsProxy")[0].checked=false;
            $("#serverIsProxy").trigger("change");
            $("#folderPath").val(dir);
            startServer($("#serverPort").val(), $("#folderPath").val());
        }
    });

    $("#folderPath").change(function () {
        if($("#serverIsProxy").is(":checked")) {
            startProxyServer();
        } else {
            startServer($("#serverPort").val(), $("#folderPath").val());
        }
    });

    loadSettings();
    $(".serverForm .checkboxes input[type=checkbox]").change(function() {
        saveSettings();
    });

    ePort({
        "startPort": 1000,
        "maxPort": 65535
    }, function (oError, selectedPort) {
        selectedPort = selectedPort || 99999;
        $("#serverPort").val(selectedPort);

        // managing drag'n'drop
        document.body.addEventListener("dragover", eventNullifier);
        document.body.addEventListener("dragenter", function (e) {
            document.body.classList.add("filedrag");
            eventNullifier.call(this, e);
        });
        document.body.addEventListener("dragleave", function (e) {
            document.body.classList.remove("filedrag");
            eventNullifier.call(this, e);
        });
        document.body.addEventListener("drop", fileDropped);
    })
}

function eventNullifier(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
};

function fileDropped(e) {
    var oFile = e.dataTransfer.files[0];
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove("filedrag");

    if($("#serverIsProxy").is(":checked")) {
        return false;
    }

    if (fsUtils.statSync(oFile.path).isDirectory()) {
        dirPath = (sRootPath = oFile.path).replace(os.homedir(), "~");
        $("#folderPath").val(dirPath);
        $("#folderPath").trigger("change");
    }
    return false;
}

function selectFolder(src) {
    var that = src;
    //e.preventDefault();
    dialog.showOpenDialog(currentWindow, {
        "properties": ["openDirectory"]
    }, function (aFolders) {
        if (lodash.isArray(aFolders)) {
            dirPath = (sRootPath = aFolders[0]).replace(os.homedir(), "~");
            $("#folderPath").val(dirPath);
            $("#folderPath").trigger("change");
        }
    });
}

function newWindow() {
    remote.getGlobal("createWindow")();
}

function clearLog() {
    $("#logHistory").html("");
}

function searchLog() {
    term=$("#searchLog").val();
    if(term!=null && term.length>0) {
        searchEnabled=true;
        $("#logHistory li").addClass("hidden");
        $("#logHistory li:contains('"+term+"')").removeClass("hidden");
    } else {
        searchEnabled=false;
        $("#logHistory li").removeClass("hidden");
    }
}
function matchSearchCriteria(li) {
    term=$("#searchLog").val();
    if(term!=null && term.length>0) {
        if(li.find("strong").text().indexOf(term)<0) {
            li.addClass("hidden");
        } else {
            li.removeClass("hidden");
        }
    }
}

function renderHistory() {
    hist = getHistory();
    $("#dirHistory").html("");
    $.each(hist, function(a,b) {
        c=b.p.split("/");
        c=c[c.length-1].split("\\");
        c=c[c.length-1];
        if(b.t==null) b.t="web";
        if(c==null || c.length<=0) return;
        
        $("#dirHistory").prepend('<a href="#" class="list-group-item" data-dir="'+b.p+'" data-type="'+b.t+'" title="'+b.p+'">'+c+' <span class="badge pull-right">'+b.t+'</span></a>');
    });
}

function toggleFieldForServerType() {
    stopServer();
    $("#folderPath").val("");
    
    if($("#serverIsProxy").is(":checked")) {
        $("#folderPath").attr("placeholder","http://someurl/").removeAttr("readonly");
        $("#folderPath").parent().find(".btn1").addClass("hidden");
        $("#folderPath").parent().find(".btn2").removeClass("hidden");
        //$("#folderPath").parent().removeClass("input-group");
        $("label[for=folderPath]").html("Web URL :");
        $("#folderPath").focus();
    } else {
        $("#folderPath").attr("placeholder","Workspace Folder").attr("readonly","true");
        $("#folderPath").parent().find(".btn2").addClass("hidden");
        $("#folderPath").parent().find(".btn1").removeClass("hidden");
        //$("#folderPath").parent().addClass("input-group");
        $("label[for=folderPath]").html("Base Folder :");
    }
}