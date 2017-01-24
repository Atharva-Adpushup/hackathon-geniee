var GenieeReport = (function(w, $) {
    var self = this;

    this.model = w.adpushup.reports.model;
    this.siteId = w.adpushup.reports.siteId;
    this.siteDomain = w.adpushup.reports.siteDomain;
    this.paramConfig = w.adpushup.reports.paramConfig;
    this.reportsLevel = {
        'pagegroup': 'Page Groups',
        'variation': 'Variations'
    };
    this.selectedReportsLevel = 'Page Groups';
    this.selectedPageGroupId = null;
    this.selectedPageGroupName = '';
    this.filterData = {
        paramConfig: $.extend(true, {}, this.paramConfig),
        date: {},
        platform: {}
    };

    // Cache DOM elements query
    this.$breadCrumbContainer = $('.js-reports-breadcrumb');
    this.$tableContainer = $('#reports_table');
    this.$perfHeaderContainer = $(".js-perf-header");
    this.$filterDateWrapper = $(".js-filter-date-wrapper");
    this.$filterDateSelectedWrapper = $(".js-filter-selected-wrapper");
    this.$filterApplyBtn = $(".js-filter-apply-btn");
    this.$filterResetBtn = $(".js-filter-reset-btn");

    // Slideout elements
    this.$slideoutPanel = $('.js-slideout-panel');
    this.$slideoutMenu = $('.js-slideout-menu');
    this.$filterButton = $(".js-filter-btn");
    this.$dataTable = null;
    // Highcharts stocks config
    this.highCharts = {
        config: {
            rangeSelector: {
                selected: 4
            },
            yAxis: {
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    compare: 'percent',
                    showInNavigator: true
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                split: true
            },
            series: []
        }
    };

    function createChart(selector, config) {
        w.Highcharts.stockChart(selector, config);
    }

    function setFilterSelectedLabel(name) {
        var $labelTpl = $("<span class='label label-default js-filter-selected js-filter-selected--date'></span>"),
            $labelBadgeTpl = $("<span class='badge js-badge'>X</span>");

        $labelTpl
            .text(name)
            .append($labelBadgeTpl);
        this.$filterDateSelectedWrapper.html($labelTpl);
    }

    function setFilterParamConfigData(dateRange) {
        this.filterData.paramConfig.dateFrom = dateRange.dateFrom;
        this.filterData.paramConfig.dateTo = dateRange.dateTo;
    }

    function setFilterDateData(obj) {
        this.filterData.date = obj;
    }

    function handleDateFilterLinksClick(e) {
        var $link = $(e.target),
            dateRange = $link.data('daterange'),
            dateRangeName = $link.data('name'),
            dateRangeObj = {},
            text = $link.text();

        dateRangeObj[dateRangeName] = dateRange;
        setFilterDateData(dateRangeObj);
        setFilterParamConfigData(dateRange);
        setFilterSelectedLabel(text);
    }

    function bindDateFilterLinks() {
        var $links = $('.js-filter-date', this.$filterDateWrapper);

        $links.off('click').on('click', handleDateFilterLinksClick);
    }

    function resetFilterConfig() {
        // Reset date filter data
        setFilterDateData({});
        //Reset filter param config
        setFilterParamConfigData(this.paramConfig);
    }

    function handleDateFilterLabelsBadgeClick(e) {
        var $badge = $(e.target);

        resetFilterConfig();
        $badge.parent().remove();
    }

    function bindDateFilterLabelsBadge() {
        this.$filterDateSelectedWrapper.off('click').on('click', '.js-badge', handleDateFilterLabelsBadgeClick.bind(this));
    }

	function getReports(paramsData, callbackConfig) {
		var url = '/user/reports/getPerformanceData',
			type = 'GET';

		$.ajax({
			type: type,
			url: url,
			dataType: 'json',
			data: paramsData,
			cache: false
		}).done(function(data) {
			data = (typeof data === 'string') ? JSON.parse(data) : data;

			if (data.success) {
				return callbackConfig.success(data);
			}

			return callbackConfig.error();
		}).fail(function() {
			callbackConfig.error();
		});
	}

    function reportsSuccessCallback(reportData) {
        console.log('Got report data: ', reportData);
    }

    function reportsErrorCallback() {
        console.error('Error loading reports');
    }

    function handleFilterApplyBtnClick(e) {
        var isLabelElem = (this.$filterDateSelectedWrapper.find('.js-filter-selected--date').length > 0),
            isDateFilterData = (Object.keys(this.filterData.date).length > 0),
            $btn = $(e.target),
            paramConfig = this.paramConfig;

        if (isLabelElem && isDateFilterData) {
            console.log('Filter date range request: ', $btn);
            getReports(paramConfig, {
                success: reportsSuccessCallback,
                error: reportsErrorCallback
            });
        }
    }

    function bindFilterApplyBtn() {
        this.$filterApplyBtn.off('click').on('click', handleFilterApplyBtnClick.bind(this));
    }

    function handleFilterResetBtnClick() {
        resetFilterConfig();
        this.$filterDateSelectedWrapper.html('');
    }

    function bindFilterResetBtn() {
        this.$filterResetBtn.off('click').on('click', handleFilterResetBtnClick.bind(this));
    }

    function initSlideoutMenu() {
        var self = this;

        this.slideout = new w.Slideout({
            'panel': self.$slideoutPanel.get(0),
            'menu': self.$slideoutMenu.get(0),
            'padding': 300,
            'tolerance': 70,
            'easing': 'cubic-bezier(.32,2,.55,.27)',
            'side': 'right'
        });
        self.$slideoutMenu.css({visibility: 'visible'});

        toggleSlideoutMenu();
    }

    function toggleSlideoutMenu() {
        var self = this;

        this.$filterButton.off('click').on('click', function(e) {
            self.slideout.toggle();
        });
    }

    function tabulateData(data, options) {
        if(typeof data !== "object") {
            return false;
        }

        options = options || {};

        var table, header, rows, footer,
            tableId = "_ap_table_" + new Date().getTime() + "_" + Math.floor(Math.random() * (1000000 - 1)) + 1,
            hide = options.hideTableColumns instanceof Array ? options.hideTableColumns : [],
            dataTableConfig = {
                "sDom": 'Rlfrtip',
                "iDisplayLength": 50
            };
        
        if (options.isFirstColumnOrderDisable) {
            dataTableConfig.columnDefs = [{"orderable": false, "targets": 0}];
        }

        table = $('<table/>').attr({
            "width": "100%",
            "id": tableId,
            "class": "_ap_table display compact"
        });

        header = $('<tr/>');
        for(var i = 0; i < data.header.length; i++) {
            if(options.hideTableColumns && hide.indexOf(i) >= 0) {
                continue;
            }
            header.append($('<th/>').html(data.header[i]));
        }
        table.append($('<thead/>').html(header));

        rows = $('<tbody/>');
        for(var i = 0; i < data.rows.length; i++) {
            var row = $('<tr/>');
            for(var j = 0; j < data.rows[i].length; j++) {
                if(options.hideTableColumns && hide.indexOf(j) >= 0) {
                    continue;
                }
                row.append($('<td/>').html(data.rows[i][j]));
            }
            rows.append(row);
        }
        table.append(rows);

        footer = $('<tr/>');
        for(var i = 0; i < data.footer.length; i++) {
            if(options.hideTableColumns && hide.indexOf(i) >= 0) {
                continue;
            }
            footer.append($('<th/>').html(data.footer[i]));
        }
        table.append($('<tfoot/>').html(footer));

        $(options.tableContainer || '#table').html(table);

        table.DataTable(dataTableConfig);

        this.$dataTable = table;
        return table;
    };

    function setTableHeading() {
        var $tableHeading = $('.js-table-heading-wrapper .js-table-heading'),
            computedHeadingText;

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            computedHeadingText = this.reportsLevel.pagegroup;
        } else if (this.selectedReportsLevel == this.reportsLevel.variation) {
            computedHeadingText = this.reportsLevel.variation;
        }

        $tableHeading.text(computedHeadingText);
    }

    function setReportsLevel(level) {
        this.selectedReportsLevel = level;
    }

    function generateBreadCrumb() {
        var breadCrumbTpl = '';

        if (this.siteId && !this.selectedPageGroupId) {
            breadCrumbTpl += '<li><span class="breadcrumb-title-prefix">Media:</span><a id="' + this.siteDomain + '" class="breadcrumb-title js-breadcrumb-siteId active">' + this.siteDomain + '</a></li>';
        } else if (this.siteId && this.selectedPageGroupId) {
            breadCrumbTpl += '<li><span class="breadcrumb-title-prefix">Media:</span><a id="' + this.siteDomain + '" class="breadcrumb-title js-breadcrumb-siteId" href="javascript:void 0;">' + this.siteDomain + '</a></li>';
            breadCrumbTpl += '<li><span class="breadcrumb-title-prefix">Page Group:</span><a id="' + this.selectedPageGroupName + '" class="breadcrumb-title js-breadcrumb-pageGroupId active">' + this.selectedPageGroupName + '</a></li>';
        }

        this.$breadCrumbContainer.html(breadCrumbTpl);
        setTooltipOnMediaBreadCrumb();
        bindMediaBreadCrumbClickHandler();
    }

    function onMediaBreadCrumbClick(e) {
        var $el = $(e.target);

        if ($el.hasClass('active')) {return false;}

        this.selectedPageGroupId = null;
        setReportsLevel(this.reportsLevel.pagegroup);
        chooseLevelAndLoadReports();
    }

    function setTooltipOnMediaBreadCrumb() {
        var $mediaBreadCrumb = $('.js-breadcrumb-siteId', this.$breadCrumbContainer),
			tooltipConfig = {
				animation: true,
				placement: 'top',
				title: 'Click to see Media level reports',
				trigger: 'hover'
			};

        if ($mediaBreadCrumb.hasClass('active')) {return false;}
        
        $mediaBreadCrumb.tooltip(tooltipConfig);
    }

    function bindMediaBreadCrumbClickHandler() {
        var $mediaBreadCrumb = $('.js-breadcrumb-siteId', this.$breadCrumbContainer);

        $mediaBreadCrumb.off('click').on('click', onMediaBreadCrumbClick.bind(this));
    }

    function getActivePageGroupId(pageGroupName) {
        var pageGroupData = $.extend(true, {}, this.model.pageGroups),
            activePageGroupId;

        delete pageGroupData.data;
        Object.keys(pageGroupData).forEach(function(pageGroupKey) {
            var pageGroupObj = pageGroupData[pageGroupKey];

            if (pageGroupObj.channelName == pageGroupName) {
                activePageGroupId = pageGroupKey;
            }
        });

        return activePageGroupId;
    }

    function onSelectionButtonClick(e) {
        var $el = $(e.target),
            $tr = $el.parentsUntil('tr').parent(),
            pageGroupName = $tr.find('td:nth-child(2)').text(),
            pageGroupFullName = $tr.find('td:nth-child(2)').text() + "_" + $tr.find('td:nth-child(3)').text(),
            pageGroupId = getActivePageGroupId(pageGroupFullName),
            $body = $('body');

            if (pageGroupId) {
                this.selectedPageGroupId = pageGroupId;
                this.selectedPageGroupName = pageGroupName;
            }
            setReportsLevel(this.reportsLevel.variation);
            chooseLevelAndLoadReports();
            setTimeout(function() {
                $body.stop().animate({scrollTop:0}, '500', 'swing');
            }, 500);
    }

    function bindSelectionButtonClickHandler() {
        var $selectionBtn = $('.js-selection-btn', this.$tableContainer);

        $selectionBtn.off('click').on('click', onSelectionButtonClick.bind(this));
    }

	function updateTableSelectionUI() {
		var $selectionEls = $('#reports_table ._ap_table > tbody > tr > td:nth-child(1)'),
            $sortThead = $('#reports_table ._ap_table > thead > tr:nth-child(1) > th:nth-child(1)'),
			$tpl,
			tooltipConfig = {
				animation: true,
				placement: 'top',
				title: 'Click to see Page group level reports',
				trigger: 'hover'
			};

        // Remove the sort icon to make first thead appear order disabled
        $sortThead.removeClass('sorting_asc').addClass('sorting_disabled');
		$selectionEls.each(function(idx, el) {
			var $el = $(el);

			$tpl = $("<button id='selection-btn-" + idx + "' class='btn btn-default btn--icon js-selection-btn' type='button'><i class='fa fa-line-chart'></i></button>");

			$el
				.html($tpl)
				.find('.js-selection-btn')
				.tooltip(tooltipConfig)
				.end();
		});
	}

    function setActiveThumbnail($thumbnail) {
        var $thumbnails = $(".js-thumbnail", this.$perfHeaderContainer);

        $thumbnails.removeClass('thumbnail--active');
        $thumbnail.addClass('thumbnail--active');
    }

    function onPerfThumbnailClick(event) {
        var $thumbnail = $(event.target);

        if ($thumbnail.parentsUntil('.js-thumbnail').parent().hasClass('js-thumbnail')) {
            $thumbnail = $thumbnail.parentsUntil('.js-thumbnail').parent();
        }

        setActiveThumbnail($thumbnail);
        prepareReportsChart($thumbnail);
    }

    function getHighChartsData(reportChartType) {
        var computedHighChartsData;

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            computedHighChartsData = this.model.pageGroups.data.highCharts[reportChartType];
        } else if ((this.selectedReportsLevel == this.reportsLevel.variation) && this.selectedPageGroupId) {
            computedHighChartsData = this.model.pageGroups[this.selectedPageGroupId].variations.data.highCharts[reportChartType];
        }

        return computedHighChartsData;
    }

    function prepareReportsChart($thumbnail) {
        var chartType, chartSeriesConfig, chartConfig;

        chartType = $thumbnail.data('text');
        chartSeriesConfig = getHighChartsData(chartType);
        chartConfig = $.extend(true, {}, this.highCharts.config);
        chartConfig.series = chartSeriesConfig;

        createChart('chart-container', chartConfig);
    }

    function setThumbnailUiData() {
        var $revenueHeader = $(".js-thumbnail.js-perf-header-revenue", this.$perfHeaderContainer),
            $pageViewsHeader = $(".js-thumbnail.js-perf-header-pageViews", this.$perfHeaderContainer),
            $clicksHeader = $(".js-thumbnail.js-perf-header-clicks", this.$perfHeaderContainer),
            $pageRPMHeader = $(".js-thumbnail.js-perf-header-pageRPM", this.$perfHeaderContainer),
            $pageCTRHeader = $(".js-thumbnail.js-perf-header-pageCTR", this.$perfHeaderContainer);

        $revenueHeader.data('text', 'revenue');
        $pageViewsHeader.data('text', 'pageviews');
        $clicksHeader.data('text', 'clicks');
        $pageRPMHeader.data('text', 'pagerpm');
        $pageCTRHeader.data('text', 'pagectr');
    }

    function getRevenueHeaderThumbnail() {
        var $revenueHeader = $(".js-thumbnail.js-perf-header-revenue", this.$perfHeaderContainer);

        return $revenueHeader;
    }

    function bindPerfThumbnailClickHandler() {
        var $thumbnails = $(".js-thumbnail", this.$perfHeaderContainer);

        $thumbnails.off('click').on('click', onPerfThumbnailClick);
    }

    function setPerfHeaderData(data) {
        var $revenueEl = $(".js-perf-header-revenue .js-panel-body", this.$perfHeaderContainer),
            $pageViewsEl = $(".js-perf-header-pageViews .js-panel-body", this.$perfHeaderContainer),
            $clicksEl = $(".js-perf-header-clicks .js-panel-body", this.$perfHeaderContainer),
            $pageRPMEl = $(".js-perf-header-pageRPM .js-panel-body", this.$perfHeaderContainer),
            $pageCTREl = $(".js-perf-header-pageCTR .js-panel-body", this.$perfHeaderContainer);

            $revenueEl.html(data.revenue);
            $pageViewsEl.html(data.pageViews);
            $clicksEl.html(data.click);
            $pageRPMEl.html(data.pageRPM);
            $pageCTREl.html(data.pageCTR);
    }

    function setTableData(data, isPageGroupLevel) {
        var tableContainerSelector = "#reports_table";

        tabulateData(data, {tableContainer: tableContainerSelector, isFirstColumnOrderDisable: isPageGroupLevel});
    }

    function chooseLevelAndLoadReports() {
        var computedTableData, computedPerfHeaderData,
            isPageGroupLevel = true,
            $revenueHeaderThumbnail = getRevenueHeaderThumbnail();

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            isPageGroupLevel = true;
            computedPerfHeaderData = $.extend(true, {}, this.model.media);
            computedTableData = $.extend(true, {}, this.model.pageGroups.data.table);
        } else if ((this.selectedReportsLevel == this.reportsLevel.variation) && this.selectedPageGroupId) {
            isPageGroupLevel = false;
            computedPerfHeaderData = $.extend(true, {}, this.model.pageGroups[this.selectedPageGroupId]);
            computedTableData = $.extend(true, {}, this.model.pageGroups[this.selectedPageGroupId].variations.data.table);
        }

        initSlideoutMenu();
        generateBreadCrumb();
        setTableHeading();
        setPerfHeaderData(computedPerfHeaderData);
        setTableData(computedTableData, isPageGroupLevel);

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            updateTableSelectionUI();
        }

        bindPerfThumbnailClickHandler();
        bindSelectionButtonClickHandler();
        bindDateFilterLinks();
        bindDateFilterLabelsBadge();
        bindFilterApplyBtn();
        bindFilterResetBtn();
        setThumbnailUiData();
        setActiveThumbnail($revenueHeaderThumbnail);
        prepareReportsChart($revenueHeaderThumbnail);
    }

    function init() {
        chooseLevelAndLoadReports();
    }

    init();

    return {
        tabulateData: tabulateData
    };
})(window, $);

window.GenieeReport = GenieeReport;
