(function(w, $) {
    var reportInstance;

    function ReportClass() {
        this.model = w.adpushup.reports.model;
        this.siteId = w.adpushup.reports.siteId;
        this.siteDomain = w.adpushup.reports.siteDomain;
        this.paramConfig = w.adpushup.reports.paramConfig;
        Object.freeze(this.paramConfig);

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
            dateType: {
                absolute: {
                    'date-from': '',
                    'date-to': ''
                }
            },
            platform: {},
            constants: {
                notification: {
                    btn: {
                        class: 'btn--notification'
                    }
                }
            }
        };

        // Cache static DOM elements
        this.$reportsWrapper = $(".js-reports-wrapper");
        this.$breadCrumbContainer = $('.js-reports-breadcrumb');
        this.$tableContainer = $('#reports_table');
        this.$perfHeaderContainer = $(".js-perf-header");
        this.$dateDescWrapper = $(".js-date-desc-wrapper");
        this.$filterDateWrapper = $(".js-filter-date-wrapper");
        this.$filterDateSelectedWrapper = $(".js-filter-selected-wrapper");
        this.$filterApplyBtn = $(".js-filter-apply-btn");
        this.$filterResetBtn = $(".js-filter-reset-btn");
        this.$headingWrapper = $(".js-main-heading-wrapper");
        this.$headingOptions = $(".js-main-heading-options");
        this.$loaderWrapper = $(".js-loaderwrapper");
        this.$notificationWrapper = $(".js-notification-wrapper");
        this.$absoluteDateInputs = $('.js-datepicker-element');
        this.$datePickerInstance = null;
        this.$collapsibleElems = $('.js-panel-collapsible');

        // Slideout elements
        this.$slideoutPanel = $('.js-slideout-panel');
        this.$slideoutMenu = $('.js-slideout-menu');
        this.$filterButton = $(".js-filter-btn");
        this.$dataTable = null;
        // Highcharts config
        w.Highcharts.setOptions({
                credits: {
                enabled: false
            },
            colors: ['#eb575c', '#555', '#c5c5c5', '#5cb85c']
        });

        this.highCharts = {
            config: {
                title: {
                    text: ''
                },
                xAxis: {
                    categories: []
                },
                series: []
            }
        };
    }

    ReportClass.prototype.handleCollapsibleClick = function(e) {
        var $elem = $(e.target);

        if (!$elem.hasClass('js-panel-collapsible')) {
            return false;
        }

        this.$collapsibleElems.not($elem).collapse('hide');
    }

    ReportClass.prototype.emulateAccordion = function() {
        this.$collapsibleElems.off('show.bs.collapse').on('show.bs.collapse', this.handleCollapsibleClick.bind(this));
    }

    ReportClass.prototype.createChart = function(selector, config) {
        w.Highcharts.chart(selector, config);
    }

    ReportClass.prototype.showNotificationWrapper = function() {
        this.$notificationWrapper.removeClass('hide');
    }

    ReportClass.prototype.hideNotificationWrapper = function() {
        this.$notificationWrapper.addClass('hide');
    }

    ReportClass.prototype.showLoader = function() {
        this.$loaderWrapper.removeClass('hide');
    }

    ReportClass.prototype.hideLoader = function() {
        this.$loaderWrapper.addClass('hide');
    }

    ReportClass.prototype.getDateString = function(dateStamps, isRemoveDay) {
        var date = new Date(dateStamps),
            dateArr = date.toDateString().split(' '),
            // Date day and month are swapped, from 'Feb 08' to '08 Feb'
            swappedDateArr = this.swapArrayItems(dateArr, 1, 2),
            dateString;

            if (isRemoveDay) {
                swappedDateArr.shift();
                dateString = swappedDateArr.join(' ');
            } else {
                dateString = swappedDateArr.join(' ').replace(" ", ", &nbsp;");
            }

        return dateString;
    }

    ReportClass.prototype.swapArrayItems = function(array, indexOne, indexTwo) {
        array[indexTwo] = array.splice(indexOne, 1, array[indexTwo])[0];

        return array;
    }

    ReportClass.prototype.insertDateDescription = function() {
        var isParamConfig = this.paramConfig,
            isDateFilter = this.isFilterData(),
            filterDateKey = (!!isDateFilter ? Object.keys(this.filterData.date)[0] : null),
            dateConfig = (!!(isDateFilter && filterDateKey) ? this.filterData.date[filterDateKey] : {
                dateFrom: this.paramConfig.dateFrom,
                dateTo: this.paramConfig.dateTo
            }),
            dateFromString = this.getDateString(dateConfig.dateFrom),
            dateToString = this.getDateString(dateConfig.dateTo),
            dateString = (dateFromString + "&nbsp; - &nbsp;" + dateToString),
            $baseTemplate = $("<ol class='breadcrumb js-date-desc u-margin-0px'><li><span class='breadcrumb-title-prefix js-date-desc-title-prefix'>Report Date:</span></li></ol>"),
            $contentTemplate = $("<a id='articlemyriad.com' class='breadcrumb-title js-date-desc-title active'></a>");

            $contentTemplate.html(dateString);
            $baseTemplate.find("li").append($contentTemplate);
            this.$dateDescWrapper.html($baseTemplate);
    }

    ReportClass.prototype.initDatePicker = function() {
        this.$datePickerInstance = this.$absoluteDateInputs.datepicker({
            format: "yyyy-mm-dd",
            orientation: "bottom right",
            clearBtn: true,
            autoClose: true
        });
    }

    ReportClass.prototype.handleDatePickerDateChange = function(e) {
        var $elem = $(e.target),
            name = $elem.attr('data-name'),
            value = $elem.val(),
            type = $elem.attr('data-type'),
            dateFromValue, dateToValue, isDateDataExists, dateRangeObj,
            selectedLabelTextArr = [],
            dateRangeTypeObj = {};

        this.setAbsoluteDateData(name, value);
        dateFromValue = this.filterData.dateType.absolute['date-from'];
        dateToValue = this.filterData.dateType.absolute['date-to'];
        isDateDataExists = !!(dateFromValue && dateToValue);

        if (isDateDataExists) {
            dateRangeObj = {
                dateFrom: dateFromValue,
                dateTo: dateToValue
            };
            dateRangeTypeObj[type] = dateRangeObj;

            selectedLabelTextArr.push(this.getDateString(dateFromValue, true));
            selectedLabelTextArr.push(this.getDateString(dateToValue, true));

            this.setFilterDateData(dateRangeTypeObj);
            this.setFilterParamConfigData(dateRangeObj);
            this.setFilterSelectedLabel(selectedLabelTextArr.join(' - '));
            this.enableFilterApplyBtn();
        }

        $elem.datepicker('hide');
    }

    ReportClass.prototype.handleDatePickerDateCleared = function(e) {
        var $elem = $(e.target);

        $elem.datepicker('update', '');
    }

    ReportClass.prototype.setAbsoluteDateData = function(name, value) {
        this.filterData.dateType.absolute[name] = value;
    }

    ReportClass.prototype.resetAbsoluteDateData = function() {
        this.filterData.dateType.absolute = {};
        this.$absoluteDateInputs.datepicker('update', '');
        this.$absoluteDateInputs.datepicker('hide');
        this.$absoluteDateInputs.val('');
    }

    ReportClass.prototype.bindDatePickerEvents = function() {
        this.$datePickerInstance.off('changeDate').on('changeDate', this.handleDatePickerDateChange.bind(this));
        this.$datePickerInstance.off('clearDate').on('clearDate', this.handleDatePickerDateCleared.bind(this));
    }

    ReportClass.prototype.insertFilterSelectedUiPlaceholder = function() {
        var $template = $("<div class='aligner aligner--column aligner--hCenter aligner--vCenter filter-selected-ui filter-selected-ui--placeholder js-filter-selected-ui-placeholder'>No filters to show.</div>"),
            isPlaceholderPresent = !!($(".js-filter-selected-ui-placeholder", this.$filterDateSelectedWrapper).length);

        if (!isPlaceholderPresent) {
            this.$filterDateSelectedWrapper.html($template);
        }
    }

    ReportClass.prototype.removeFilterSelectedUiPlaceholder = function() {
        var $placeholder = $(".js-filter-selected-ui-placeholder", this.$filterDateSelectedWrapper);

        if ($placeholder.length) {
            $placeholder.remove();
        }
    }

    ReportClass.prototype.prependResetReportsBtn = function() {
        var $template = $("<button id='report-reset-btn' data-loading-text='Resetting...' autocomplete='off' type='button' class='btn btn-default btn-theme btn-theme--primary u-margin-r10px js-report-reset-btn js-filter-reset'>Reset filters</button>"),
            isBtnPresent = !!($(".js-report-reset-btn", this.$headingOptions).length);

        if (!isBtnPresent) {
            this.$headingOptions.prepend($template);
        }
    }

    ReportClass.prototype.removeResetReportsBtn = function() {
        var $btn = $(".js-report-reset-btn", this.$headingOptions);

        if ($btn.length) {
            $btn.remove();
        }
    }

    ReportClass.prototype.disableFilterApplyBtn = function() {
        this.$filterApplyBtn
            .attr({ disabled: true })
            .addClass('disabled');
    }

    ReportClass.prototype.enableFilterApplyBtn = function() {
        this.$filterApplyBtn
            .attr({ disabled: false })
            .removeClass('disabled');
    }

    ReportClass.prototype.addFilterBtnNotification = function() {
        var className = this.filterData.constants.notification.btn.class;

        if (!this.$filterButton.hasClass(className)) {
            this.$filterButton.addClass(className);
        }
    }

    ReportClass.prototype.removeFilterBtnNotification = function() {
        var className = this.filterData.constants.notification.btn.class;

        if (this.$filterButton.hasClass(className)) {
            this.$filterButton.removeClass(className);
        }
    }

    ReportClass.prototype.setFilterSelectedLabel = function(name) {
        var $labelTpl = $("<span class='label label-default js-filter-selected js-filter-selected--date'></span>"),
            $labelBadgeTpl = $("<span class='badge js-badge'>X</span>");

        $labelTpl
            .text(name)
            .append($labelBadgeTpl);
        this.$filterDateSelectedWrapper.html($labelTpl);
    }

    ReportClass.prototype.setFilterParamConfigData = function(dateRange) {
        this.filterData.paramConfig.dateFrom = dateRange.dateFrom;
        this.filterData.paramConfig.dateTo = dateRange.dateTo;
    }

    ReportClass.prototype.setFilterDateData = function(obj) {
        this.filterData.date = obj;
    }

    ReportClass.prototype.handleDateFilterLinksClick = function(e) {
        var $link = $(e.target),
            dateRange = $link.data('daterange'),
            dateRangeName = $link.data('name'),
            dateRangeObj = {},
            text = $link.text();

        dateRangeObj[dateRangeName] = dateRange;
        this.setFilterDateData(dateRangeObj);
        this.setFilterParamConfigData(dateRange);
        this.setFilterSelectedLabel(text);
        this.enableFilterApplyBtn();
        this.resetAbsoluteDateData();
    }

    ReportClass.prototype.bindDateFilterLinks = function() {
        var $links = $('.js-filter-date', this.$filterDateWrapper);

        $links.off('click').on('click', this.handleDateFilterLinksClick.bind(this));
    }

    ReportClass.prototype.resetFiltersFunctionality = function() {
        var self = this;

        this.resetFilterConfig();
        this.removeFilterBtnNotification();
        this.resetAbsoluteDateData();
        this.$filterDateSelectedWrapper.html('');
        this.insertFilterSelectedUiPlaceholder();
        if (this.slideout.isOpen()) {
            this.slideout.close();
        }

        w.setTimeout(function() {
            self.loadReportsWithInitialData();
            self.removeResetReportsBtn();
        }, 500);
    }

    ReportClass.prototype.resetFilterConfig = function() {
        // Reset date filter data
        this.setFilterDateData({});
        //Reset filter param config
        this.setFilterParamConfigData(this.paramConfig);
    }

    ReportClass.prototype.isFilterData = function() {
        return Object.keys(this.filterData.date).length;
    }

    ReportClass.prototype.resetFilterUI = function() {
        var isDateFilter = this.isFilterData();

        if (!isDateFilter) {
            this.disableFilterApplyBtn();
            this.removeFilterBtnNotification();
            this.insertFilterSelectedUiPlaceholder();
        }
    }

    ReportClass.prototype.handleDateFilterLabelsBadgeClick = function(e) {
        var $badge = $(e.target);

        this.resetFilterConfig();
        this.resetFilterUI();
        $badge.parent().remove();
    }

    ReportClass.prototype.bindDateFilterLabelsBadge = function() {
        this.$filterDateSelectedWrapper.off('click').on('click', '.js-badge', this.handleDateFilterLabelsBadgeClick.bind(this));
    }

    ReportClass.prototype.reInitReports = function(reportData) {
        var self = this,
            isDateFilter = this.isFilterData();

        if (isDateFilter) {
            this.triggerFilterBtnClick();
        }

        w.setTimeout(function() {
            self.model = $.extend(true, {}, reportData);
            self.setAndLoadPageGroupReports();

            if (isDateFilter) {
                self.addFilterBtnNotification();
            } else {
                self.removeFilterBtnNotification();
            }
        }, 1000);
    }

    ReportClass.prototype.loadReportsWithInitialData = function() {
        var paramConfig = this.paramConfig,
            $filterResetBtn = $('.js-filter-reset');

        $filterResetBtn.button('loading');
        this.getReports(paramConfig, {
            success: this.reportsSuccessCallback.bind(this),
            error: this.reportsErrorCallback.bind(this)
        }, $filterResetBtn);
    }

    ReportClass.prototype.setAndLoadPageGroupReports = function() {
        this.selectedPageGroupId = null;
        this.setReportsLevel(this.reportsLevel.pagegroup);
        this.chooseLevelAndLoadReports();
    }

	ReportClass.prototype.getReports = function(paramsData, callbackConfig, $btn) {
		var url = '/user/site/' + this.siteId + '/reports/getPerformanceData',
			type = 'GET', self = this;

        this.showLoader();

		$.ajax({
			type: type,
			url: url,
			dataType: 'json',
			data: paramsData,
			cache: false
		}).done(function(data) {
			data = (typeof data === 'string') ? w.JSON.parse(data) : data;

			if (data.success) {
                if ($btn) { $btn.button('reset'); }
                self.hideLoader();
				return callbackConfig.success(data.data);
			}

            self.hideLoader();
            if ($btn) { $btn.button('reset'); }
			return callbackConfig.error();
		}).fail(function() {
            self.hideLoader();
            if ($btn) { $btn.button('reset'); }
			callbackConfig.error();
		});
	}

    ReportClass.prototype.reportsSuccessCallback = function(reportData) {
        this.reInitReports(reportData);
    }

    ReportClass.prototype.reportsErrorCallback = function() {
        if (this.slideout.isOpen()) {
            this.slideout.close();
        }
        this.showNotificationWrapper();
    }

    ReportClass.prototype.handleFilterApplyBtnClick = function(e) {
        var isLabelElem = (this.$filterDateSelectedWrapper.find('.js-filter-selected--date').length > 0),
            filterData = Object.keys(this.filterData.date),
            isDateFilterData = !!filterData.length,
            $btn = $(e.target),
            paramConfig = this.paramConfig,
            self = this;

        if (isLabelElem && isDateFilterData) {
            paramConfig = $.extend(true, {}, this.filterData.paramConfig);
            this.prependResetReportsBtn();
            $btn.button('loading');

            this.getReports(paramConfig, {
                success: self.reportsSuccessCallback.bind(self),
                error: self.reportsErrorCallback.bind(self)
            }, $btn);
        }
    }

    ReportClass.prototype.handleFilterResetBtnClick = function() {
        this.hideNotificationWrapper();
        this.resetFiltersFunctionality();
    }

    ReportClass.prototype.handleReportResetBtnclick = function() {
        this.hideNotificationWrapper();
        this.resetFiltersFunctionality();
    }

    ReportClass.prototype.bindFilterApplyBtn = function() {
        this.$filterApplyBtn.off('click').on('click', this.handleFilterApplyBtnClick.bind(this));
    }

    ReportClass.prototype.bindFilterResetBtn = function() {
        this.$filterResetBtn.off('click').on('click', this.handleFilterResetBtnClick.bind(this));
    }

    ReportClass.prototype.bindReportResetBtn = function() {
        this.$headingWrapper.off('click').on('click', '.js-report-reset-btn', this.handleReportResetBtnclick.bind(this));
        $('.js-report-reset-btn', this.$notificationWrapper).off('click').on('click', this.handleReportResetBtnclick.bind(this));
    }

    ReportClass.prototype.initSlideoutMenu = function() {
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

        self.toggleSlideoutMenu();
        self.disableFilterApplyBtn();
    }

    ReportClass.prototype.triggerFilterBtnClick = function() {
        this.$filterButton.click();
    }

    ReportClass.prototype.toggleSlideoutMenu = function() {
        var self = this;

        this.$filterButton.off('click').on('click', function(e) {
            self.slideout.toggle();
        });
    }

    ReportClass.prototype.tabulateData = function(data, options) {
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

    ReportClass.prototype.setTableHeading = function() {
        var $tableHeading = $('.js-table-heading-wrapper .js-table-heading'),
            computedHeadingText;

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            computedHeadingText = this.reportsLevel.pagegroup;
        } else if (this.selectedReportsLevel == this.reportsLevel.variation) {
            computedHeadingText = this.reportsLevel.variation;
        }

        $tableHeading.text(computedHeadingText);
    }

    ReportClass.prototype.setReportsLevel = function(level) {
        this.selectedReportsLevel = level;
    }

    ReportClass.prototype.generateBreadCrumb = function() {
        var breadCrumbTpl = '';

        if (this.siteId && !this.selectedPageGroupId) {
            breadCrumbTpl += '<li><span class="breadcrumb-title-prefix">Media:</span><a id="' + this.siteDomain + '" class="breadcrumb-title js-breadcrumb-siteId active">' + this.siteDomain + '</a></li>';
        } else if (this.siteId && this.selectedPageGroupId) {
            breadCrumbTpl += '<li><span class="breadcrumb-title-prefix">Media:</span><a id="' + this.siteDomain + '" class="breadcrumb-title js-breadcrumb-siteId" href="javascript:void 0;">' + this.siteDomain + '</a></li>';
            breadCrumbTpl += '<li><span class="breadcrumb-title-prefix">Page Group:</span><a id="' + this.selectedPageGroupName + '" class="breadcrumb-title js-breadcrumb-pageGroupId active">' + this.selectedPageGroupName + '</a></li>';
        }

        this.$breadCrumbContainer.html(breadCrumbTpl);
        this.setTooltipOnMediaBreadCrumb();
        this.bindMediaBreadCrumbClickHandler();
    }

    ReportClass.prototype.onMediaBreadCrumbClick = function(e) {
        var $el = $(e.target);

        if ($el.hasClass('active')) { return false; }
        this.setAndLoadPageGroupReports();
    }

    ReportClass.prototype.setTooltipOnMediaBreadCrumb = function() {
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

    ReportClass.prototype.bindMediaBreadCrumbClickHandler = function() {
        var $mediaBreadCrumb = $('.js-breadcrumb-siteId', this.$breadCrumbContainer);

        $mediaBreadCrumb.off('click').on('click', this.onMediaBreadCrumbClick.bind(this));
    }

    ReportClass.prototype.getActivePageGroupId = function(pageGroupName) {
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

    ReportClass.prototype.onSelectionButtonClick = function(e) {
        var $el = $(e.target),
            $tr = $el.parentsUntil('tr').parent(),
            pageGroupName = $tr.find('td:nth-child(2)').text(),
            pageGroupFullName = $tr.find('td:nth-child(2)').text() + "_" + $tr.find('td:nth-child(3)').text(),
            pageGroupId = this.getActivePageGroupId(pageGroupFullName),
            $body = $('body');

            if (pageGroupId) {
                this.selectedPageGroupId = pageGroupId;
                this.selectedPageGroupName = pageGroupName;
            }
            this.setReportsLevel(this.reportsLevel.variation);
            this.chooseLevelAndLoadReports();
            w.setTimeout(function() {
                $body.stop().animate({scrollTop:0}, '500', 'swing');
            }, 500);
    }

    ReportClass.prototype.bindSelectionButtonClickHandler = function() {
        var $selectionBtn = $('.js-selection-btn', this.$tableContainer);

        $selectionBtn.off('click').on('click', this.onSelectionButtonClick.bind(this));
    }

	ReportClass.prototype.updateTableSelectionUI = function() {
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

    ReportClass.prototype.setActiveThumbnail = function($thumbnail) {
        var $thumbnails = $(".js-thumbnail", this.$perfHeaderContainer);

        $thumbnails.removeClass('thumbnail--active');
        $thumbnail.addClass('thumbnail--active');
    }

    ReportClass.prototype.onPerfThumbnailClick = function(event) {
        var $thumbnail = $(event.target);

        if ($thumbnail.parentsUntil('.js-thumbnail').parent().hasClass('js-thumbnail')) {
            $thumbnail = $thumbnail.parentsUntil('.js-thumbnail').parent();
        }

        this.setActiveThumbnail($thumbnail);
        this.prepareReportsChart($thumbnail);
    }

    ReportClass.prototype.setXAxisCategories = function(dataArr) {
        var computedData = [], self = this;

        if (dataArr && dataArr.length) {
            dataArr[0].data.forEach(function(itemArr) {
                var category = self.getDateString(itemArr[0], true);
                computedData.push(category);
            });
        }

        return computedData;
    }

    ReportClass.prototype.computeColumnChart = function(data) {
        var computedData = [],
            isDataExists = !!(data && data.length);

        if (isDataExists) {
            data.forEach(function(dataItemObj) {
                var columnObj = {
                    type: 'column',
                    name: dataItemObj.name,
                    data: []
                };

                dataItemObj.data.forEach(function(itemArr) {
                    var value = itemArr[1];

                    value = (value.toString().indexOf('.') > -1) ? Number(value.toFixed(2)) : value;
                    columnObj.data.push(value);
                });

                computedData.push(columnObj);
            });
        }

        return computedData;
    }

    ReportClass.prototype.computeSplineChart = function(data) {
        var collectionArr, collectionArrLength, iterator,
            isDataExists = !!(data && data.length),
            chartConfig = {
                type: 'spline',
                name: 'Average',
                data: [],
                marker: {
                    lineWidth: 2,
                    lineColor: w.Highcharts.getOptions().colors[3],
                    fillColor: 'white'
                }
            };

        if (isDataExists) {
            // Set collectionArr length to first object's data array length
            // This us part of computing an average spline chart data
            collectionArrLength = data[0].data.length;
            // Initialise collection array with computed length
            collectionArr = new Array(collectionArrLength);

            // Set every item as an array
            for (iterator = 0; iterator < collectionArrLength; iterator++) { collectionArr[iterator] = []; }

            // Push every data item in collection array as per index
            data.forEach(function(dataItemObj, dataItemIdx) {
                dataItemObj.data.forEach(function(item, itemIdx) {
                    collectionArr[itemIdx].push(item);
                });
            });

            collectionArr.forEach(function(collectionItemArr, collectionItemIndex) {
                var sum = collectionItemArr.reduce(function(accumulation, value) { return accumulation + value; }, 0),
                    average, weightedValueArr = [], weightedSum;
                
                if (sum === 0) {
                    average = sum;
                } else {
                    collectionItemArr.forEach(function(item) {
                        var contributionPercentage = ((item / sum) * 100),
                            weightedValue;

                        contributionPercentage = (contributionPercentage && contributionPercentage !== Infinity) ? contributionPercentage : 0;
                        weightedValue = (item * contributionPercentage);
                        weightedValueArr.push(weightedValue);
                    });

                    weightedSum = weightedValueArr.reduce(function(accumulation, value) { return accumulation + value}, 0);
                    average = Number((weightedSum / 100).toFixed(2));
                }

                chartConfig.data.push(average);
            });
        }

        return [chartConfig];
    }

    ReportClass.prototype.getHighChartsData = function(reportChartType) {
        var computedData = {}, reportTypeData,
            chartData = {
                xAxisCategories: [],
                column: [],
                spline: []
            };

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            reportTypeData = this.model.pageGroups.data.highCharts[reportChartType];
        } else if ((this.selectedReportsLevel == this.reportsLevel.variation) && this.selectedPageGroupId) {
            reportTypeData = this.model.pageGroups[this.selectedPageGroupId].variations.data.highCharts[reportChartType];
        }

        chartData.xAxisCategories = this.setXAxisCategories(reportTypeData);
        chartData.column = this.computeColumnChart(reportTypeData);
        chartData.spline = this.computeSplineChart(chartData.column);

        computedData.xAxisCategories = chartData.xAxisCategories;
        computedData.series = chartData.column.concat(chartData.spline);

        return computedData;
    }

    ReportClass.prototype.prepareReportsChart = function($thumbnail) {
        var chartType, chartSeriesConfig, chartConfig;

        chartType = $thumbnail.data('text');
        chartSeriesConfig = this.getHighChartsData(chartType);
        chartConfig = $.extend(true, {}, this.highCharts.config);
        chartConfig.series = chartSeriesConfig.series;
        chartConfig.xAxis.categories = chartSeriesConfig.xAxisCategories;
        chartConfig.title.text = (this.selectedReportsLevel + ' performance');

        this.createChart('chart-container', chartConfig);
    }

    ReportClass.prototype.setThumbnailUiData = function() {
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

    ReportClass.prototype.getRevenueHeaderThumbnail = function() {
        var $revenueHeader = $(".js-thumbnail.js-perf-header-revenue", this.$perfHeaderContainer);

        return $revenueHeader;
    }

    ReportClass.prototype.bindPerfThumbnailClickHandler = function() {
        var $thumbnails = $(".js-thumbnail", this.$perfHeaderContainer);

        $thumbnails.off('click').on('click', this.onPerfThumbnailClick.bind(this));
    }

    ReportClass.prototype.setPerfHeaderData = function(data) {
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

    ReportClass.prototype.setTableData = function(data, isPageGroupLevel) {
        var tableContainerSelector = "#reports_table";

        this.tabulateData(data, {tableContainer: tableContainerSelector, isFirstColumnOrderDisable: isPageGroupLevel});
    }

    ReportClass.prototype.chooseLevelAndLoadReports = function() {
        var computedTableData, computedPerfHeaderData,
            isPageGroupLevel = true,
            $revenueHeaderThumbnail = this.getRevenueHeaderThumbnail();

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            isPageGroupLevel = true;
            computedPerfHeaderData = $.extend(true, {}, this.model.media);
            computedTableData = $.extend(true, {}, this.model.pageGroups.data.table);
        } else if ((this.selectedReportsLevel == this.reportsLevel.variation) && this.selectedPageGroupId) {
            isPageGroupLevel = false;
            computedPerfHeaderData = $.extend(true, {}, this.model.pageGroups[this.selectedPageGroupId]);
            computedTableData = $.extend(true, {}, this.model.pageGroups[this.selectedPageGroupId].variations.data.table);
        }

        this.initSlideoutMenu();
        this.generateBreadCrumb();
        this.setTableHeading();
        this.insertDateDescription();
        this.initDatePicker();
        this.setPerfHeaderData(computedPerfHeaderData);
        this.setTableData(computedTableData, isPageGroupLevel);
        this.emulateAccordion();

        if (this.selectedReportsLevel == this.reportsLevel.pagegroup) {
            this.updateTableSelectionUI();
        }

        this.bindPerfThumbnailClickHandler();
        this.bindSelectionButtonClickHandler();
        this.bindDateFilterLinks();
        this.bindDateFilterLabelsBadge();
        this.bindFilterApplyBtn();
        this.bindFilterResetBtn();
        this.bindReportResetBtn();
        this.bindDatePickerEvents();

        this.setThumbnailUiData();
        this.setActiveThumbnail($revenueHeaderThumbnail);
        this.prepareReportsChart($revenueHeaderThumbnail);
    }

    ReportClass.prototype.init = function() {
        this.chooseLevelAndLoadReports();
    }

    reportInstance = new ReportClass();
    reportInstance.init();
})(window, $);
