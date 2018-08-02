const requireLive = require('require-reload')(require);
const remote = require('electron').remote;
const os = require('os');
const fsUtils = require('fs');
const fsExtra = require('fs-extra');
const fsPath = require('path');

const winston = require('winston');

//const saveFile = require('electron').remote.require('electron-save-file');
//const dialogUtils = require('electron').remote.dialog 
//const electronShortcut = require('electron').remote.require('electron-localshortcut');

//Loading other libs
const handleBars = require('handlebars');
const hashMD5 = require('md5');
const moment = require("moment");
const vue = require("vue");

var isWin = /^win/.test(process.platform);

var APPCONFIG={};

var macAddress="FF:FF:FF:FF:FF:FF";
var deviceID=null;

var logger = null;

$(function() {
    try {
        netAdd=os.networkInterfaces();
        netKeys=Object.keys(netAdd);
        macAddress=netAdd[netKeys[netKeys.length-1]][0]['mac'];
        macAddress=macAddress.toUpperCase();
    } catch(e) {
        console.log("MAC Address Not Found");
    }
    deviceID=hashMD5(macAddress);

    //Disable all Std <a> Links
    $("body").delegate("a[href]:not([data-toggle])","click",function() {
        href=$(this).attr('href');
        if(href=="#" || href=="##" || href.substr(0,2)=="##") return true;
        return false;
    });

    //Start normal process
    $.ajax("./app/app.json").done(function(data) {
        data=$.parseJSON(data);
        APPCONFIG=data;

        // APPCONFIG.DEBUG=appUtils.isDev();

        if(APPCONFIG.APPENV.toUpperCase()=="DEV" || APPCONFIG.APPENV.toUpperCase()=="DEVELOPMENT") {
            APPCONFIG=$.extend(APPCONFIG,APPCONFIG.SETTINGS.DEV);
        } else {
            APPCONFIG=$.extend(APPCONFIG,APPCONFIG.SETTINGS.PROD);
        }

        if(APPCONFIG.HOME==null) APPCONFIG.HOME="#home";

        if(APPCONFIG.UICONFIG==null) APPCONFIG.UICONFIG={};
        if(APPCONFIG.POLICIES==null) APPCONFIG.POLICIES={};

        // initLoggers();
        // appDebugger();

        $("body").load("./app/app.html");
    });
});

/*Other Supporting Functions*/
function showLoader(divContainer,msgBody="") {
    $(divContainer).html("<div class='ajaxloading text-center'><br><br><div class='fa fa-spinner fa-spin fa-5x'></div><br><br>"+msgBody+"</div>");
}
function showMessage(msgBody, title="") {
    $("#alertMsg .msgbody").html(("<strong>"+title+"</strong> "+msgBody).trim());
    $("#alertMsg").addClass("in");
}

