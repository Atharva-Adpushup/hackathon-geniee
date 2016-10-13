(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    SALT:"_ADP_RANDOMIZER_",
    BASE_URL:"http://app.adpushup.com",
    isForceMcm: true,
    enums:{
        priorities:{
            EXISTING_OBJECT : "EXISTING_OBJECT",
            NEW_OBJECT : "NEW_OBJECT"
        }
    },
    Queue:{
        SITES_TO_SYNC_ADSENSE : "data::sitesToSyncAdsense",
        MCM_LINKS : "data::mcmLinks"
    },
    errors:{
        NO_ADSENSE_ACCOUNT_CONNECTED:"No adsense account connected",
        NO_ADS_TO_SYNC:"No ads to sync yet",
        USER_NOT_MANAGED:"User is not managed"
    }
}
},{}],2:[function(require,module,exports){
var config = require("../../../../configs/commonConsts");

(function () {
    var socket = io.connect(config.BASE_URL);
    var $params = $("#input-hidden--params");
    var $getMcmLink = $("#btn-getMcmLink");
    var $mcmInviteAlert = $("#link-mcmInvite-success");
    var $mcmInviteLink = $("a", $mcmInviteAlert);
    var $verifyMcmInvitation = $("#btn-mcmInviteDone");
    var $mcmSuccess = $("#mcmInvite-success");
    var $mcmError = $("#mcmInvite-error");
    var $mcmInviteRetry = $("#btn-retryMcmLink");
    
    var templateParams = {
        userEmail: $params.attr("data-userEmail"),
        pubId: $params.attr("data-pubId"),
        adsenseEmail: $params.attr("data-adsenseEmail")
    };

    socket.on("connect", function () {
        console.log("Socket is connected now!");
    });

    function enableMcmLink(url) {
        $getMcmLink.addClass("hide");
        $mcmInviteAlert
            .find("a").attr({"href": url})
            .end()
            .removeClass("hide");
    }
    
    function enableVerifyMcmBtn() {
        $mcmInviteAlert.addClass("hide");
        $verifyMcmInvitation.removeClass("hide");
    }
    
    function checkInvitationComplete(data) {
        $verifyMcmInvitation
        .button("reset")
        .addClass("hide");
        
        if (data.success) {
            $mcmSuccess.removeClass("hide");
            $mcmError.addClass("hide");
        } else {
            $mcmSuccess.addClass("hide");
            $mcmError.removeClass("hide");
        }
    }
    
    function verifyMcmInvitation(e) {
        $(this).button("loading");
        socket.emit("verifyMcmInvitation", templateParams);
    }
    
    $getMcmLink.off("click").on("click", function(e) {
        $(this).button("loading");
        socket.emit("getMcmLink", {email:templateParams.adsenseEmail});
    });
    
    socket.on("inviteLink", function (data) {
        $getMcmLink.button("reset");
        enableMcmLink(data.link);
    });
    
    $mcmInviteLink.off("click").on("click", function (e) {
        var $link = $(this);
        
        e.preventDefault();
        enableVerifyMcmBtn();
        window.open($link.attr("href"));
    });
    
    $verifyMcmInvitation.off("click").on("click", verifyMcmInvitation);    
    $mcmInviteRetry.off("click").on("click", verifyMcmInvitation);
    
    socket.on("isMcmInvitationComplete", function (data) {
        checkInvitationComplete(data);
    });
    
    window.mcmConn = {
        enableMcmLink: enableMcmLink,
        enableVerifyMcmBtn: enableVerifyMcmBtn,
        checkInvitationComplete: checkInvitationComplete        
    }
})();
},{"../../../../configs/commonConsts":1}]},{},[2]);
