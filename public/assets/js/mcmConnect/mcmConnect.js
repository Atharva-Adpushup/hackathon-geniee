(function () {
    var $params = $("#input-hidden--params");
    var $jumbotronContainer = $("#jumbotron-mcmConnect > .container");
    var $getMcmLink = $("#btn-getMcmLink");
    var $mcmInviteAlert = $("#link-mcmInvite-success");
    var $mcmInviteErrorAlert = $("#link-mcmInvite-error");
    var $mcmInviteLink = $("a", $mcmInviteAlert);
    var $verifyMcmInvitation = $("#btn-mcmInviteDone");
    var $mcmSuccess = $("#mcmInvite-success");
    var $mcmError = $("#mcmInvite-error");
    var $mcmInviteRetry = $("#btn-retryMcmInvite");
    var $retryMcmLink = $("#btn-retryMcmLink");
    var socket = io.connect($params.attr("data-baseUrl"));    
    var templateParams = {
        userEmail: $params.attr("data-userEmail"),
        pubId: $params.attr("data-pubId"),
        adsenseEmail: $params.attr("data-adsenseEmail")
    };
    
    function hideAllElems() {
        $jumbotronContainer.children().find(".btn").button("reset");
        $jumbotronContainer.children().not(".heading").addClass("hide");
    }
    
    function enableMcmLink(url) {
        hideAllElems();

        $mcmInviteAlert
            .find("a").attr({"href": url})
            .end()
            .removeClass("hide");
    }
    
    function enableVerifyMcmBtn() {
        hideAllElems();

        $verifyMcmInvitation.removeClass("hide");
    }
    
    function checkInvitationComplete(data) {
        hideAllElems();

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
    
    function showErrorAlert(obj) {
        if (!obj.success) {
            hideAllElems();

            if (obj.lastcommand === "getMcmLink") {
                $mcmInviteErrorAlert.removeClass("hide");
            } else if (obj.lastcommand === "verifyMcmInvitation") {
                $mcmError.removeClass("hide");                
            }
        }
    }
    
    function getMcmInvite(e) {
        $(this).button("loading");
        socket.emit("getMcmLink", {email:templateParams.adsenseEmail});        
    }

    socket.on("connect", function () {
        $retryMcmLink.off("click").on("click", getMcmInvite);
        $getMcmLink.off("click").on("click", getMcmInvite);
        
        socket.on("inviteLink", function (data) {
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

        window.mcmConnect = {
            enableMcmLink: enableMcmLink,
            enableVerifyMcmBtn: enableVerifyMcmBtn,
            checkInvitationComplete: checkInvitationComplete,
            showErrorAlert: showErrorAlert
        };
    });

    socket.on("err", function (obj) {
        console.error("Error connecting Socket: ", obj);
        
        showErrorAlert(obj);
    });

    socket.on("disconnect", function () {
        console.log("Socket disconnected");
    });

})();