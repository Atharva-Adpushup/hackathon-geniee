(function (w, d, $) {
    var a = (w.adpushup = w.adpushup || {});

    a.log = function(msg) {
        if (typeof console != "undefined" && typeof console.log === "function") {
            console.log(msg);
        }
    };

    a.notify = function(title, message, slide) {
        var opts, container;
        opts = {};
        opts.classes = ['smokey'];
        opts.classes.push("slide");
        $("#freeow-tr").freeow(title, message, opts);
    };

    a.alert = function(message, container, type) {
        $(container).html($('<div/>').css({
            "width": "75%",
            "text-align": "center",
            "margin": "50px auto"
        }).attr({
            "role": "alert",
            "class": "alert " + (type == 1 ? "alert-success" : type == 2 ? "alert-danger" : "alert-info")
        }).html(message));
    };

    a.showLoader = function(container) {
        $(container).html($('<div/>').attr({
            "class": "loaderwrapper spinner"
        }).html('<img src="//app.adpushup.com/public/assets/images/loaderLogo.png">'));
    };

    $(function() {
        if(typeof w.location.hash === "string") {
            var hash = w.location.hash;

            if(hash.indexOf("#addSite") >= 0) {
                $('#addSite').modal('show');
            }
        }
    });
})(window, document, jQuery);
