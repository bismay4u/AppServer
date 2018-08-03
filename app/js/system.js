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
        $("#folderPath").val(dir);
        startServer($("#serverPort").val(), $("#folderPath").val());
    });

    $("#folderPath").change(function () {
        startServer($("#serverPort").val(), $("#folderPath").val());
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
        $("#dirHistory").prepend('<a href="#" class="list-group-item" data-dir="'+b.p+'" title="'+b.p+'">'+c+'</a>');
    });
}