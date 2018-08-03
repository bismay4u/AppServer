const requireLive = require('require-reload')(require);
const remote = require('electron').remote;
const shell = require( "electron" ).shell;
const dialog = remote.dialog;
const os = require('os');
const fsUtils = require('fs');
const fsExtra = require('fs-extra');
const fsPath = require('path');

const winston = require('winston');

const currentWindow = remote.getCurrentWindow();

//const saveFile = require('electron').remote.require('electron-save-file');
//const dialogUtils = require('electron').remote.dialog 
//const electronShortcut = require('electron').remote.require('electron-localshortcut');

//Loading other libs
const hashMD5 = require('md5');
const moment = require("moment");
const lodash = require("lodash");
// const vue = require("vue");
// const handleBars = require('handlebars');
// const underscore = require("underscore");

const fsize = require("filesize");
const mimer = require("mimer");
const ePort = require("empty-port");
const express = require("express");
const ehbars = require( "express-handlebars" );

var isWin = /^win/.test(process.platform);

var APPCONFIG={};

var macAddress="FF:FF:FF:FF:FF:FF";
var deviceID=null;

var logger = null;

$(function() {
    //Disable all Std <a> Links
    $("body").delegate("a[href]:not([data-toggle])","click",function() {
        href=$(this).attr('href');
        if(href=="#" || href=="##" || href.substr(0,2)=="##") return true;
        return false;
    });
    
    $.ajax("./app/app.json").done(function(data) {
        data=$.parseJSON(data);
        APPCONFIG=data;

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

        currentWindow.show();
    });
});

/*Other Supporting Functions*/
function showLoader(divContainer,msgBody="") {
    $(divContainer).html("<div class='ajaxloading text-center'><br><br><div class='fa fa-spinner fa-spin fa-5x'></div><br><br>"+msgBody+"</div>");
}
function showMessage(msgBody, title="") {
    $("#alertMsg .msgbody").html(("<strong>"+title+"</strong> "+msgBody).trim());
    $("#alertMsg").removeClass("hidden").addClass("in");
}
function removeMessage() {
    $("#alertMsg").removeClass("in").addClass("hidden");
}

