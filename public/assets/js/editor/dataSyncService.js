// To pull async data about channels as soon as the application loads.
// Because the data is asynchronous, it the communication will done via callbacks
// in fetching the data.

var $ = require('libs/third-party/jquery');

module.exports = (function ($) {
    var DataSyncService = {
        flux: null,

        initFlux: function (flux) {
            this.flux = flux;
        },


        request: function (jqAjaxObjs, successCallback, failureCallback) {
            $.when.apply(this, jqAjaxObjs).done(successCallback).fail(failureCallback);
        },

        save: function (url, data, successCallback, failureCallback) {
            var request = $.ajax({
                type: "POST",
                url: url,
                data: data,
                dataType: "json"
            });

            request.done(successCallback).fail(failureCallback);

            return request;
        },

        isApInstalled: function (url, siteId) {
            return $.getJSON('/proxy/detectAp?url=' + encodeURI(url) + '&site=' + siteId);
        },

        detectAdsenseAds: function (url) {
            var dfd = $.Deferred();
            $.getJSON('/proxy/detect_adsense_ads?url=' + encodeURI(url)).done(function (response) {
                response['has_ads'] ? dfd.resolve(true) : dfd.resolve(false);
            }.bind(this));

            return dfd.promise();
        },
        loadStats: function (siteId) {
            var dfd = $.Deferred();
            /*setTimeout(function(){
             var json = JSON.parse(localStorage.getItem("ADP_STATS"));
             json ? dfd.resolve(json.data) : dfd.reject();
             },0)*/
            $.getJSON('/user/reports/editorStatsData?siteId=' + siteId).done(function (response) {
                response['has_ads'] ? dfd.resolve(true) : dfd.resolve(false);
            }.bind(this));

            return dfd.promise();
        },
        loadChannelStats: function (pageGroup, platform, startDate, endDate) {
            var dfd = $.Deferred(),
                endDate = endDate ? endDate : +new Date(),
                startDate = startDate ? startDate : +new Date().setDate(new Date().getDate() - 30),
                config = {
                    siteId: window.ADP_SITE_ID,
                    platform: platform,
                    pageGroup: pageGroup,
                    startDate: startDate,
                    endDate: endDate
                };
            /* setTimeout(function(){
             var json = JSON.parse(localStorage.getItem("ADP_STATS"));
             json && json.success ? dfd.resolve(json.data) : dfd.reject();
             },1000)*/
            $.getJSON('/user/reports/editorStatsData?' + $.param(config)).done(function(response) {
                (response.success && response.data && Object.keys(response.data).length > 0) ? dfd.resolve(response.data) : dfd.reject(response.data);
            }).fail(function(response) {
                dfd.reject(response);
            });

            return dfd.promise();
        },
        changeSiteMode: function (siteId, mode) {
            var dfd = $.Deferred();
            this.save("/data/changeMode", {siteId: siteId, mode: mode}).then(function (response) {
                response['success'] ? dfd.resolve(true) : dfd.resolve(false);
            }.bind(this))
            return dfd.promise();
        },
        deleteChannel: function (platform, pageGroup) {
            var dfd = $.Deferred();
            this.save("/data/deleteChannel?siteId=" + window.ADP_SITE_ID, {
                platform: platform,
                pageGroup: pageGroup
            }).then(function (response) {
                response['success'] ? dfd.resolve(response) : dfd.reject(response);
            }.bind(this), function (response) {
                dfd.reject(response)
            })
            return dfd.promise();
        },

        // saveChannel: function(channel, sucesscallback, failureCallback){
        //     this.save('/data/saveChannelData', channel.toJSON(this.flux) );
        // },

        masterSave: function (data) {
            console.log("Got masterSaved data: ", data);
            return this.save('/data/saveData', {data: JSON.stringify(data)});
        }
    };
    return DataSyncService;
})($);
