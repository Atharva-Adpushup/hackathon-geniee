var GenieeReport = (function(w, $) {
    this.model = w.adpushup.reports.model;
    this.siteId = w.adpushup.reports.siteId;
    this.reportsLevel = {
        'pagegroup': 'Page Groups',
        'variation': 'Variations'
    };
    this.selectedReportsLevel = 'Page Groups';
    this.selectedPageGroupId = null;
    // Cache DOM elements query
    this.$breadCrumbContainer = $('.js-reports-breadcrumb');
    this.$tableContainer = $('#reports_table');
    this.$perfHeaderContainer = $(".js-perf-header");
    // Slideout elements
    this.$slideoutPanel = $('.js-slideout-panel');
    this.$slideoutMenu = $('.js-slideout-menu');
    this.$filterButton = $(".js-filter-btn");
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

    function createChart(options) {
        w.Highcharts.stockChart(options.selector, options.config);
    }

    function initSlideoutMenu() {
        var self = this;

        this.slideout = new w.Slideout({
            'panel': self.$slideoutPanel.get(0),
            'menu': self.$slideoutMenu.get(0),
            'padding': 256,
            'tolerance': 70,
            'easing': 'cubic-bezier(.32,2,.55,.27)',
            'side': 'right'
        });

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
            hide = options.hideTableColumns instanceof Array ? options.hideTableColumns : [];

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

        table.DataTable({
            "sDom": 'Rlfrtip',
            "iDisplayLength": 50
        });

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

        breadCrumbTpl += '<li><a id="media-name" class="js-breadcrumb-media active">Media</a></li>';

        if (this.siteId && !this.selectedPageGroupId) {
            breadCrumbTpl += '<li><a id="' + this.siteId + '" class="js-breadcrumb-siteId active">' + this.siteId + '</a></li>';
        } else if (this.siteId && this.selectedPageGroupId) {
            breadCrumbTpl += '<li><a id="' + this.siteId + '" class="js-breadcrumb-siteId" href="javascript:void 0;">' + this.siteId + '</a></li>';
            breadCrumbTpl += '<li><a id="pagegroup-name" class="js-breadcrumb-pagegroup active">Page Group</a></li>';
            breadCrumbTpl += '<li><a id="' + this.selectedPageGroupId + '" class="js-breadcrumb-pageGroupId active">' + this.selectedPageGroupId + '</a></li>';
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
            pageGroupName = $tr.find('td:nth-child(2)').text() + "_" + $tr.find('td:nth-child(3)').text(),
            pageGroupId = getActivePageGroupId(pageGroupName),
            $body = $('body');

            if (pageGroupId) {
                this.selectedPageGroupId = pageGroupId;
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
			$tpl,
			tooltipConfig = {
				animation: true,
				placement: 'top',
				title: 'Click to see Page group level reports',
				trigger: 'hover'
			};

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

    function onPerfThumbnailClick(event) {
        var $el = $(event.target),
            $thumbnails = $(".js-thumbnail", this.$perfHeaderContainer);
        
        if ($el.parentsUntil('.js-thumbnail').parent().hasClass('js-thumbnail')) {
            $el = $el.parentsUntil('.js-thumbnail').parent();
        }

        $thumbnails.removeClass('thumbnail--active');
        $el.addClass('thumbnail--active');
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

    function setTableData(data) {
        var tableContainerSelector = "#reports_table";

        tabulateData(data, {tableContainer: tableContainerSelector});
    }

    function chooseLevelAndLoadReports() {
        var computedTableData, computedPerfHeaderData;

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            computedPerfHeaderData = $.extend(true, {}, this.model.media);
            computedTableData = $.extend(true, {}, this.model.pageGroups.data.table);
        } else if ((this.selectedReportsLevel == this.reportsLevel.variation) && this.selectedPageGroupId) {
            computedPerfHeaderData = $.extend(true, {}, this.model.pageGroups[this.selectedPageGroupId]);
            computedTableData = $.extend(true, {}, this.model.pageGroups[this.selectedPageGroupId].variations.data.table);
        }

        initSlideoutMenu();
        generateBreadCrumb();
        setTableHeading();
        setPerfHeaderData(computedPerfHeaderData);
        setTableData(computedTableData);

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            updateTableSelectionUI();
        }

        bindPerfThumbnailClickHandler();
        bindSelectionButtonClickHandler();
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
