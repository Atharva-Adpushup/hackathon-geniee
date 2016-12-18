$(document).ready(function() {
    for (var i = 0, j = adpushup.user.sites, k = j[i], options; i < j.length; k = j[++i]) {
        options = $(document.createDocumentFragment()).append($('<option/>').html("All Pages"));
        if (k.siteId == parseInt($("#report_siteDomain option:selected").attr("data-siteId"))) {
            for (var x = 0, y = k.pageGroups, z = y[x]; x < y.length; z = y[++x]) {
                options.append($('<option/>').attr({ "data-value": z }).html(z))
            }
            $("#report_pageGroup").html(options);
        }
    }

    adpushup.reports.config = {
        "siteId": parseInt($("#report_siteDomain option:selected").attr("data-siteId")),
        "siteDomain": $("#report_siteDomain option:selected").attr("data-value"),
        "setupName": $("#report_siteDomain option:selected").attr("data-setupName"),
        "platform": $("#report_platform option:selected").attr("data-value"),
        "pageGroup": $("#report_pageGroup option:selected").attr("data-value"),
        "startDate": Math.round(+new Date()) - 604800000,
        "endDate": Math.round(+new Date()),
        "step": "1d",
        "chartType": "areaChart",
        "showX": true,
        "showY": false,
        "chartContainer": "#reports_chart",
        "tableContainer": "#reports_table",
        "notify": true,
        "alert": true,
        "reportType": $("#report_type").attr("data-value"),
        "adsenseMetric": $("#report_adsenseMetric option:selected").attr("data-value")
    };

    function removeSelectOptionIfApex() {
        var $allPagesEl = $('#report_pageGroup > option:first-child');

        if (adpushup.reports.config.reportType.toLowerCase() === 'apex') {
            if ($allPagesEl.length && ($allPagesEl.text().toLowerCase() === 'all pages')) {
                $allPagesEl.remove();
            }
        }
    }

    removeSelectOptionIfApex();

    $(".report_control").on("change", function(e) {
        var param = $(this).attr("data-param");
        var value = $(this).find(":selected").attr("data-value");

        adpushup.reports.config[param] = value;

        if (param == "siteDomain") {
            adpushup.reports.config.siteId = parseInt($(this).find(":selected").attr("data-siteId"));
            adpushup.reports.config.setupName = $(this).find(":selected").attr("data-setupName");

            for (var i = 0, j = adpushup.user.sites, k = j[i], options; i < j.length; k = j[++i]) {
                options = $(document.createDocumentFragment()).append($('<option/>').html("All Pages"));
                if (k.domain == value) {
                    for (var x = 0, y = k.pageGroups, z = y[x]; x < y.length; z = y[++x]) {
                        options.append($('<option/>').attr({ "data-value": z }).html(z))
                    }
                    $("#report_pageGroup").html(options);
                    return;
                }
            }
        }

        removeSelectOptionIfApex();
    });

    $('.date_control').datepicker({
        autoclose: true,
        format: "yyyy-mm-dd"
    }).on('change', function() {
        adpushup.reports.config[$(this).attr("data-param")] = new Date($(this).val()).getTime();
    });

    $(".step_control").on("click", function(e) {
        var param = $(this).attr("data-param");
        var value = $(this).attr("data-value");

        adpushup.reports.config[param] = value;
        $('#load_report').click();
        $(".step_control").removeClass("active");
        $(this).addClass("active");
    });

    $('#load_report').on('click', function() {
        if ('ControlVsAdpushupCtr' === adpushup.reports.config.reportType) {
            adpushup.reports.controlVsAdpushupCtr(adpushup.reports.config).done(function(d) {
                $("#controlCtr").html(d.success ? d.data.footer[3] : '-');
                $("#adpushupCtr").html(d.success ? d.data.footer[6] : '-');
            });

        } else if ('AdSense' === adpushup.reports.config.reportType || 'adx' === adpushup.reports.config.reportType) {
            adpushup.reports.config.adsenseDomain = $("#report_adsenseDomain option:selected").val();
            adpushup.reports.config.pubId = $("#report_pubId").val();

            adpushup.reports.AdSense(adpushup.reports.config);
        } else if ('apex' === adpushup.reports.config.reportType) {
            adpushup.reports.config.pageGroup = $("#report_pageGroup option:selected").val();
            adpushup.reports.Apex(adpushup.reports.config, function(apexData, dataTable) {
                window.ApexReport.setData(apexData, dataTable);
                window.ApexReport.setClassNames();
                window.ApexReport.updateTrafficDistributionUI();
                window.ApexReport.selectControlVariation();
                window.ApexReport.updateTableSelectionUI();
                window.ApexReport.updateTableRPMUI();
                window.ApexReport.initTDPopovers();
                window.ApexReport.setTDEventHandlers();
                setTimeout(function() {
                    window.ApexReport.calculatePageRPMPerformance();
                }, 8000);
            });
        }
    }).click();

    $('#take_to_editor').on('click', function() {
        if ($("#report_adsenseDomain").length)  // this element exists in case of adsense reports
        {
            window.location = "/user/editor?siteId=" + $("#report_adsenseDomain").find(":selected").attr("data-siteId");
        }
        else if ($("#report_siteDomain").length) {
            window.location = "/user/editor?siteId=" + $("#report_siteDomain").find(":selected").attr("data-siteId");
        }
    });
});
