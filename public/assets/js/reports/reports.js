(function (w, d, $) {
    function Report(options) {
        this.siteId = options.siteId;
        this.siteDomain = options.siteDomain;
        this.reportType = options.reportType;
        this.platform = options.platform;
        this.pageGroup = options.pageGroup;
        this.startDate = options.startDate || Math.round(+new Date()) - 604800000;
        this.endDate = options.endDate || Math.round(+new Date());
        this.step = options.step || '1d';
        this.adsenseMetric = options.adsenseMetric;
        this.adsenseDomain = options.adsenseDomain;
        this.pubId = options.pubId;

        this.reportParams = ["siteId", "siteDomain", "reportType", "platform", "pageGroup", "startDate", "endDate", "step", "adsenseMetric", "adsenseDomain", "pubId"];
    }

    Report.prototype.requestServer = function() {
        for (var i = 0, j = this.reportParams, k = j[i], data = {}; i < j.length; k = j[++i]) {
            data[k] = this[k];
        }

        (typeof NProgress == "object") && NProgress.start();

        var request = $.ajax({
            type: 'GET',
            url: '/user/reports/' + data.reportType + "Data",
            dataType: 'json',
            data: data,
            cache: false
        });

        request.always(function() {
            (typeof NProgress == "object") && NProgress.done();
        });

        return request;
    };

    var adpushup = (w.adpushup = w.adpushup || {});
    var reports = (adpushup.reports = adpushup.reports || {});

    reports.controlVsAdpushupCtr = function(options) {

        var r = new Report(options);
        var s = r.requestServer();

        s.done(function(d) {
            if(d.success) {
                if(d.data.rows.length == 0) {
                    options.notify && adpushup.notify("Notification", "Report data not available.");
                    options.alert && adpushup.alert("Report data not available.", options.chartContainer, 3);
                    return;
                }

                options.hideChartSeries = [1,2,4,5];

                adpushup.dv[options.chartType](d.data, options);
                if(options.tableContainer) {
                    adpushup.dv.tabulateData(d.data, options);
                }
            } else {
                options.notify && adpushup.notify("Notification", "Something went wrong.");
                options.alert && adpushup.alert("Something went wrong.", options.chartContainer, 3);
            }
        }).fail(function(d) {
            options.notify && adpushup.notify("Error", "Request failed.");
            options.alert && adpushup.alert("Request failed.", options.chartContainer, 2);
        });

        return s;
    };

    reports.controlVsAdpushupPageviews = function(options) {

        var r = new Report(options);
        var s = r.requestServer();

        s.done(function(d) {
            if(d.success) {
                if(d.data.rows.length == 0) {
                    options.notify && adpushup.notify("Notification", "Report data not available.");
                    options.alert && adpushup.alert("Report data not available.", options.chartContainer, 3);
                    return;
                }

                adpushup.dv[options.chartType](d.data, options);
                if(options.tableContainer) {
                    adpushup.dv.tabulateData(d.data, options);
                }
            } else {
                options.notify && adpushup.notify("Notification", "Something went wrong.");
                options.alert && adpushup.alert("Something went wrong.", options.chartContainer, 3);
            }
        }).fail(function(d) {
            options.notify && adpushup.notify("Error", "Request failed.");
            options.alert && adpushup.alert("Request failed.", options.chartContainer, 2);
        });

        return s;
    };

    reports.AdSense = function(options) {

        var r = new Report(options);
        var s = r.requestServer();

        s.done(function(d) {
            if(d.success) {
                if(d.data.rows.length == 0) {
                    options.notify && adpushup.notify("Notification", "Report data not available.");
                    options.alert && adpushup.alert("Report data not available.", options.chartContainer, 3);
                    return;
                }

                adpushup.dv[options.chartType](d.data, options);
                if(options.tableContainer) {
                    adpushup.dv.tabulateData(d.data, options);
                }
            } else {
                options.notify && adpushup.notify("Notification", "Something went wrong.");
                options.alert && adpushup.alert("Something went wrong.", options.chartContainer, 3);
            }
        }).fail(function(d) {
            options.notify && adpushup.notify("Error", "Request failed.");
            options.alert && adpushup.alert("Request failed.", options.chartContainer, 2);
        });

        return s;
    };

    reports.Apex = function(options, completionCallback) {

        var r = new Report(options);
        var s = r.requestServer();
        var dataTable;

        s.done(function(d) {
            if (d.success) {
                if(d.data.rows.length == 0) {
                    options.notify && adpushup.notify("Notification", "Report data not available.");
                    options.alert && adpushup.alert("Report data not available.", options.chartContainer, 3);
                    return;
                }

                // adpushup.dv[options.chartType](d.data, options);

                if (options.tableContainer) {
                    dataTable = adpushup.dv.tabulateData(d.data, options);

                    if (typeof completionCallback === 'function') {
                        completionCallback(d.data, dataTable);
                    }
                }
            } else {
                options.notify && adpushup.notify("Notification", "Something went wrong.");
                options.alert && adpushup.alert("Something went wrong.", options.chartContainer, 3);
            }
        }).fail(function(d) {
            options.notify && adpushup.notify("Error", "Request failed.");
            options.alert && adpushup.alert("Request failed.", options.chartContainer, 2);
        });

        return s;
    };

})(window, document, $);