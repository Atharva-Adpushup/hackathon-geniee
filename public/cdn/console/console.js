(function ($) {
    function is_collapsable(arg) {
        return arg instanceof Object && Object.keys(arg).length > 0;
    }

    function json2html(json) {
        html = '';
        if (typeof json === 'string') {
            html += '<span class="json-string">"' + json + '"</span>';
        }
        else if (typeof json === 'number') {
            html += '<span class="json-literal">' + json + '</span>';
        }
        else if (typeof json === 'boolean') {
            html += '<span class="json-literal">' + json + '</span>';
        }
        else if (json === null) {
            html += '<span class="json-literal">null</span>';
        }
        else if (json instanceof Array) {
            if (json.length > 0) {
                html += '[<ol class="json-array">';
                for (var i in json) {
                    html += '<li>';
                    if (is_collapsable(json[i]))
                        html += '<a href class="json-toggle"></a>';
                    html += json2html(json[i]);
                    if (i < json.length - 1)
                        html += ',';
                    html += '</li>';
                }
                html += '</ol>]';
            }
            else {
                html += '[]';
            }
        }
        else if (typeof json === 'object') {
            var key_count = Object.keys(json).length;
            if (key_count > 0) {
                html += '{<ul class="json-dict">';
                for (var i in json) {
                    if (json.hasOwnProperty(i)) {
                        html += '<li>';
                        if (is_collapsable(json[i]))
                            html += '<a href class="json-toggle"></a>';
                        html += i + ': ' + json2html(json[i]);
                        if (--key_count > 0)
                            html += ',';
                        html += '</li>';
                    }
                }
                html += '</ul>}';
            }
            else {
                html += '{}';
            }
        }
        return html;
    }

    $.fn.json_viewer = function (json) {
        return this.each(function () {
            var html = json2html(json)
            if (is_collapsable(json))
                html = '<a href class="json-toggle"></a>' + html;

            $(this).unbind('click');
            $.fn.html.call($(this), html);
            $(this).on('click', 'a.json-toggle', function () {
                var target = $(this).toggleClass('collapsed').siblings('ul.json-dict, ol.json-array');
                target.toggle();
                var count = target.children('li').length;
                if (target.is(':visible')) {
                    target.siblings('.json-placeholder').remove();
                }
                else {
                    var placeholder = count + (count > 1 ? ' items' : ' item');
                    target.after('<span class="json-placeholder">' + placeholder + '</span>');
                }
                return false;
            });
        });
    };
})(adpushup.ap.$);

(function (w, d) {
    var adp = w.adpushup || {};

    if (!adp.ap) {
        return;
    }

    var $ = adp.ap.$;

    var filepath = "//dev.adpushup.com/public/cdn/console/files/";

    var apcc = $('<div/>').attr({
        "id": "ap-con-container"
    });

    var apch = $('<div/>').attr({
        "id": "ap-con-header"
    }).html(
        '<a href="http://www.adpushup.com/" target="_blank"><img src="' + filepath + 'ap-logo.png" width="100px" height="20px" style="margin-left: 5px; margin-bottom: -5px;" /></a> '+
        '<span style="color:#ADA9A9; font-weight: bold;">Console</span>'+
        '<img src="' + filepath + 'close.png" id="ap-con-close" style="float: right; margin-right: 10px; cursor: pointer;">'+
        '<img src="' + filepath + 'toggle.gif" id="ap-con-toggle" style="float: right; margin-right: 10px; cursor: pointer;">'
    );

    var apcb = $('<div/>').attr({
        "id": "ap-con-body"
    }).html(
        '<ul class="ap-con-tabs">'+
        '<li class="ap-con-tab-link ap-con-current" data-tab="ap-con-tab-1">Status</li>'+
        '<li class="ap-con-tab-link" data-tab="ap-con-tab-2">Stack Trace</li>'+
        '<li class="ap-con-tab-link" data-tab="ap-con-tab-3">Messages</li>'+
        '<li class="ap-con-tab-link" data-tab="ap-con-tab-4">Testing</li>'+
        '</ul>'+
        '<div id="ap-con-tab-1" class="ap-con-tab-content ap-con-current">'+
        'Status'+
        '</div>'+
        '<div id="ap-con-tab-2" class="ap-con-tab-content">'+
        'Stack Trace'+
        '</div>'+
        '<div id="ap-con-tab-3" class="ap-con-tab-content">'+
        'No Messages'+
        '</div>'+
        '<div id="ap-con-tab-4" class="ap-con-tab-content">'+
        'Testing'+
        '</div>'
    );

    $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', filepath + 'console.css'));
    $('body').append(apcc.append([apch, apcb]));

    $(document).ready(function(){
        $('#ap-con-body').height(0.30 * screen.height);

        var msg = 'Everything seems OK.';

        switch(adp.ap.stackTrace.code) {
            case 1.0:
                msg = 'E3 Request failed, Control not found.';
                break;
            case 1.1:
                msg = 'E3 Request failed, Triggered control.';
                break;
            case 2.0:
                msg = 'E3 failure, Control not found.';
                break;
            case 2.1:
                msg = 'E3 failure, Triggered control.';
                break;
            case 3.0:
                msg = 'No ads delivered by E3, Control not found.';
                break;
            case 3.1:
                msg = 'No ads delivered by E3, Triggered control.';
                break;
        }

        $('#ap-con-tab-1').html('<div class="ap-con-msg">' + msg + '</div>');
        $('#ap-con-tab-2').json_viewer(adp.ap.stackTrace);
        $('#ap-con-tab-3').html('No Messages');
        $('#ap-con-tab-4').html('');

        $('ul.ap-con-tabs li').click(function(){
            var tab_id = $(this).attr('data-tab');

            $('ul.ap-con-tabs li').removeClass('ap-con-current');
            $('.ap-con-tab-content').removeClass('ap-con-current');

            $(this).addClass('ap-con-current');
            $('#'+tab_id).addClass('ap-con-current');
        });

        $('#ap-con-toggle').click(function(){
            $('#ap-con-body').slideToggle();
        });

        $('#ap-con-close').click(function(){
            $('#ap-con-container').fadeOut('slow', function() { $(this).remove(); });
        });
    });
})(window, document);