var ApexReport = (function(w, $) {
	var _dataTable, _apexData;

	function setApexData(data) {
		_apexData = data;
	}

	function setDataTable(dataTable) {
		_dataTable = dataTable;
	}

	function setClassNames() {
		var $table = $('#reports_table ._ap_table'),
			$theadTh = $table.find('> thead > tr > th'),
			$tbodyTr = $table.find('> tbody > tr'),
			$tfootTh = $table.find('> tfoot > tr > th'),
			classNameArr = ['js-selection', 'js-variationName', 'js-ctr', 'js-pageViews', 'js-revenue', 'js-pageRPM', 'js-traffic'];

		$theadTh.each(function(idx, el) {
			var $el = $(el), className = classNameArr[idx] + '-thead-item';

			$el.addClass(className);
		});

		$tbodyTr.each(function(idx, el) {
			var $el = $(el), $td = $el.find('> td');

			$td.each(function(iidx, tdEl) {
				var $tdEl = $(tdEl), className = classNameArr[iidx] + '-tbody-item';

				$tdEl.addClass(className);
			});
		});

		$tfootTh.each(function(idx, el) {
			var $el = $(el), className = classNameArr[idx] + '-tfoot-item';

			$el.addClass(className);
		});
	}

	function selectControlVariation() {
		var $tbody = $('#reports_table ._ap_table').find('tbody'),
			$ctrEls = $tbody.find('tr > .js-ctr-tbody-item'), $controlTr, ctrArr = [],
			controlCtr, controlTrIndex;

		$ctrEls.each(function(idx, el) {
			ctrArr.push(Number($(el).text()));
		});

		controlCtr = Math.min.apply(null, ctrArr);
		controlTrIndex = ctrArr.indexOf(controlCtr);

		$controlTr = $tbody.find(' > tr:nth-child(' + (controlTrIndex + 1) + ')');
		$controlTr.addClass('selected');
	}

	function updateTableRPMUI() {
		var $rpmEls = $('#reports_table ._ap_table > tbody > tr > .js-pageRPM-tbody-item'),
			$tpl,
			tooltipConfig = {
				animation: true,
				placement: 'top',
				title: 'Get RPM for this variation',
				trigger: 'hover'
			};

		$rpmEls.each(function(idx, el) {
			var $el = $(el);
			$tpl = $("<button id='rpm-btn-" + idx + "' class='btn btn-default btn--icon js-rpm-btn' type='button'>GET</button>");

			$el
				.html($tpl)
				.find('.js-rpm-btn')
				.tooltip(tooltipConfig)
				.end();
		});

		setRPMEventListeners();
		getRPMValue();
	}

	function updateTableSelectionUI() {
		var $selectionEls = $('#reports_table ._ap_table > tbody > tr > .js-selection-tbody-item'),
			$tpl,
			tooltipConfig = {
				animation: true,
				placement: 'top',
				title: 'Set as Control variation',
				trigger: 'hover'
			},
			selectedElTipConfig = $.extend({}, tooltipConfig);

		selectedElTipConfig.title = 'Control Variation';

		$selectionEls.each(function(idx, el) {
			var $el = $(el), isSelectedEl = $el.parent().hasClass('selected');

			$tpl = $("<button id='selection-btn-" + idx + "' class='btn btn-default btn--icon js-selection-btn' type='button'></button>");

			$el.html($tpl);
			setSelectionEventListeners();

			if (isSelectedEl) {
				$el
					.find('.js-selection-btn')
					.tooltip(selectedElTipConfig)
					.click()
					.end();
			} else {
				$el
					.find('.js-selection-btn')
					.tooltip(tooltipConfig)
					.end();
			}
		});
	}

	function getCTRPerformance($trEls, controlConfig) {
		var performanceArr = [],
			config = {
				icon: {
					'tpl': {
						'success': "<i class='fa fa-caret-up icon-caret js-icon'></i>",
						'error': "<i class='fa fa-caret-down icon-caret js-icon'></i>"
					},
					'str': {
						'success': 'success',
						'warning': 'warning'
					}
				}
			},
			popoverConfig = {
				'animation': true,
				'content': '',
				'placement': 'top',
				'html': true,
				'title': 'Significance',
				'trigger': 'hover'
			};

		$trEls.each(function(idx, el) {
			var $el = $(el),
				$variationNameEl = $el.find('> .js-variationName-tbody-item'),
				$ctrEl = $el.find('> .js-ctr-tbody-item'),
				ctr = Number($ctrEl.text()),
				pageViews = _apexData.tracked[ctr].pageViews,
				clicks = _apexData.tracked[ctr].adClicks,
				perfValue = Math.round(((ctr - controlConfig.ctr) / controlConfig.ctr) * 100),
				alphaValue = 0.05, significanceResult,
				signClassNames = 'popover-content-text-block text-uppercase text-bold',
				significanceModel = w.SS.getModel(controlConfig.pageViews, pageViews, controlConfig.clicks, clicks),
				perfStr = '<div class="popover-content-text-block">Variation ' + $variationNameEl.text() + ' is performing <strong style="font-size:1.2em;display:inline-block;margin:0 3px;">' + (Math.abs(perfValue)).toString() + '%</strong>';

			significanceResult = w.SS.test(significanceModel, alphaValue);

			performanceArr.push(perfValue);

			if (perfValue > 0) {
				perfStr += 'better than control variation</div>';
				signClassNames += (significanceResult.success) ? ' text-success' : ' text-error';
				perfStr += '<div class="' + signClassNames + '">' + significanceResult.str + '</div>';
				perfStr += '<ul class="list-group"><li class="list-group-item"><span class="badge">' + pageViews +  '</span>Page Views</li>';
				perfStr += '<li class="list-group-item"><span class="badge"> ' + clicks + '</span>Clicks</li></ul>';

				popoverConfig.content = perfStr;

				$ctrEl
					.addClass('perf')
					.append($(config.icon.tpl.success))
					.find('.js-icon')
					.text(perfValue)
					.popover(popoverConfig)
					.end();

				if (significanceResult.success && !significanceResult.incomplete) {
					$ctrEl.addClass('perf--high');
				} else if (!significanceResult.success) {
					$ctrEl.addClass('perf--low');
				}
			} else if (perfValue === 0) {
				$ctrEl.addClass('perf perf--equal');
			} else {
				perfStr += 'worse than control variation</div>';
				perfStr += '<ul class="list-group"><li class="list-group-item"><span class="badge">' + pageViews +  '</span>Page Views</li>';
				perfStr += '<li class="list-group-item"><span class="badge"> ' + clicks + '</span>Clicks</li></ul>';

				popoverConfig.content = perfStr;

				$ctrEl
					.addClass('perf perf--lowest')
					.append($(config.icon.tpl.error))
					.find('.js-icon')
					.text(perfValue)
					.popover(popoverConfig)
					.end();
			}
		});
	}

	function calculateCTRPerformance($targetBtn) {
		var $targetTr = $targetBtn.parentsUntil('tr').parent(),
			$targetCTRTd = $targetTr.find(' > .js-ctr-tbody-item'),
			ctr = Number($targetCTRTd.text()),
			pageViews = _apexData.tracked[ctr].pageViews,
			clicks = _apexData.tracked[ctr].adClicks,
			targetConfig = {
				'pageViews': Number(pageViews),
				'clicks': Number(clicks),
				'ctr': ctr,
				'$el': $targetCTRTd
			},
			$otherTrEls = $targetBtn.parentsUntil('tbody').parent().find('> tr').not($targetTr);

		return getCTRPerformance($otherTrEls, targetConfig);
	}

	function getSelectedTr() {
		var $trEls = $('#reports_table ._ap_table > tbody > tr'),
			$selectedTr, $otherTrEls;

		$trEls.each(function(idx, el) {
			var $tr = $(el);

			$selectedTr = ($tr.hasClass('selected')) ? $tr : $selectedTr;
		});

		$otherTrEls = $trEls.not($selectedTr);
		return [$selectedTr, $otherTrEls];
	}

	function getPageRPMPerformance($trEls, controlConfig) {
		var performanceArr = [],
			config = {
				icon: {
					'tpl': {
						'success': "<i class='fa fa-caret-up icon-caret js-icon'></i>",
						'error': "<i class='fa fa-caret-down icon-caret js-icon'></i>"
					},
					'str': {
						'success': 'success',
						'warning': 'warning'
					}
				}
			},
			popoverConfig = {
				'animation': true,
				'content': '',
				'placement': 'top',
				'html': true,
				'title': 'Significance',
				'trigger': 'hover'
			};

		$trEls.each(function(idx, el) {
			var $el = $(el),
				$variationNameEl = $el.find('> .js-variationName-tbody-item'),
				$pageRPMEl = $el.find('> .js-pageRPM-tbody-item'),
				pageRPM = $pageRPMEl.text().trim(),
				pageViews = $el.find('.js-pageViews-tbody-item').text().trim(),
				revenue = $el.find('.js-revenue-tbody-item').text().trim(),
				alphaValue = 0.05, significanceResult,
				signClassNames = 'popover-content-text-block text-uppercase text-bold',
				significanceModel, perfValue, perfStr;

			if (!!(pageRPM) && !!(pageViews) && !!(revenue) && ($pageRPMEl.find('.js-icon').length === 0)) {
				pageRPM = Number(pageRPM);
				pageViews = Number(pageViews);
				revenue = Number(revenue);

				perfValue = Math.round(((pageRPM - controlConfig.rpm) / controlConfig.rpm) * 100);
				significanceModel = w.SS.getModel(controlConfig.pageViews, pageViews, controlConfig.revenue, revenue);
				significanceResult = w.SS.test(significanceModel, alphaValue);
				perfStr = '<div style="display: block; margin-bottom: 5px;">Variation ' + $variationNameEl.text() + ' is performing <strong style="font-size:1.2em;display:inline-block;margin:0 3px;">' + (Math.abs(perfValue)).toString() + '%</strong>';
				performanceArr.push(perfValue);

				if (perfValue > 0) {
					perfStr += 'better than control variation</div>';
					signClassNames += (significanceResult.success) ? ' text-success' : ' text-error';
					perfStr += '<div class="' + signClassNames + '">' + significanceResult.str + '</div>';
					popoverConfig.content = perfStr;

					$pageRPMEl
						.addClass('perf')
						.append($(config.icon.tpl.success))
						.find('.js-icon')
						.text(perfValue)
						.popover(popoverConfig)
						.end();

					if (significanceResult.success && !significanceResult.incomplete) {
						$pageRPMEl.addClass('perf--high');
					} else if (!significanceResult.success) {
						$pageRPMEl.addClass('perf--low');
					}
				} else if (perfValue === 0) {
					$pageRPMEl.addClass('perf perf--equal');
				} else {
					perfStr += 'worse than control variation</div>';
					popoverConfig.content = perfStr;

					$pageRPMEl
						.addClass('perf perf--lowest')
						.append($(config.icon.tpl.error))
						.find('.js-icon')
						.text(perfValue)
						.popover(popoverConfig)
						.end();
				}
			}
		});
	}

	function calculatePageRPMPerformance($el) {
		var $targetTr, trArr = getSelectedTr(), pageRpm, pageViews, revenue,
			$otherTrEls, $selectedTr, targetConfig;

		if (!$el) {
			$targetTr = trArr[0];
		} else {
			$targetTr = ($el.get(0).tagName.toLowerCase() === 'td') ? $el.parent() : $el.parentsUntil('tr').parent();
		}

		if ($targetTr.hasClass('selected')) {
			$selectedTr = $targetTr;
		} else {
			return false;
		}

		$otherTrEls = trArr[1];
		pageRpm = $selectedTr.find('.js-pageRPM-tbody-item').text().trim();
		pageViews = $selectedTr.find('.js-pageViews-tbody-item').text().trim();
		revenue = $selectedTr.find('.js-revenue-tbody-item').text().trim();

		if (!!(pageRpm) && !!(pageViews) && !!(revenue)) {
			targetConfig = {
				rpm: Number(pageRpm),
				pageViews: Number(pageViews),
				revenue: Number(revenue),
				$trEl: $selectedTr
			};

			return getPageRPMPerformance($otherTrEls, targetConfig);
		}

		return false;
	}

	function handleSelectionBtnClick(e) {
		var $el = $(e.target),
			classNameConfig = {
				btn: {
					'selected': 'selected'
				},
				icon: {
					'tpl': '<i class="fa fa-check"></i>',
					'iconTpl': "<i class='fa fa-info-circle js-icon'></i>"
				}
			},
			tooltipConfig = {
				animation: true,
				placement: 'top',
				title: 'Set as Control variation',
				trigger: 'hover'
			},
			selectedElTipConfig = $.extend({}, tooltipConfig),
			$selectedTr;

		selectedElTipConfig.title = 'Control Variation';
		$el = ($el.parent().hasClass('js-selection-btn')) ? $el.parent() : $el;

		if ($el.hasClass(classNameConfig.btn.selected)) {
			return false;
		}

		$selectedTr = $el.parentsUntil('tbody').parent().find('tr');

		$selectedTr.removeClass(classNameConfig.btn.selected);
		$selectedTr
			.find('.js-selection-btn')
			.html('')
			.removeClass(classNameConfig.btn.selected)
			.end();
		$selectedTr
			.find('> .js-ctr-tbody-item > .js-icon')
			.remove()
			.end();
		$selectedTr
			.find('> .js-pageRPM-tbody-item > .js-icon')
			.remove()
			.end();
		$selectedTr
			.find('> .js-ctr-tbody-item')
			.removeClass('perf perf--high perf--equal perf--low perf--lowest')
				.find('> .js-icon')
				.remove()
				.end();

		$selectedTr
			.find('> .js-pageRPM-tbody-item')
			.removeClass('perf perf--high perf--equal perf--low perf--lowest')
				.find('> .js-icon')
				.remove()
				.end()
			.end();

		$el.addClass(classNameConfig.btn.selected)
			.html($(classNameConfig.icon.tpl))
			.parentsUntil('tr').parent()
			.addClass(classNameConfig.btn.selected)
				.find('> .js-ctr-tbody-item')
				.append($(classNameConfig.icon.iconTpl))
					.find('.js-icon')
					.tooltip({
						animation: true,
						placement: 'top',
						title: 'This CTR is selected as Control CTR',
						trigger: 'hover'
					})
					.end()
				.end();

		calculateCTRPerformance($el);
		calculatePageRPMPerformance($el);
	}

	function setSelectionEventListeners() {
		var $selectionBtns = $('#reports_table .js-selection-btn');

		$selectionBtns.off('click').on('click', handleSelectionBtnClick);
	}

	function setRPMEventListeners() {
		var $rpmBtns = $('#reports_table .js-rpm-btn');

		$rpmBtns.off('click').on('click', handleRPMBtnClick);
	}

	function getRPMValue() {
		var $rpmBtns = $('#reports_table .js-rpm-btn');

		$rpmBtns.click();
	}

	function handleRPMBtnClick(e) {
		var $el = $(e.target), paramConfig,
			$parentEl = $el.parent(),
			$pageViewsEl = $el.parentsUntil('tr').parent().find('.js-pageViews-tbody-item'),
			$revenueEl = $el.parentsUntil('tr').parent().find('.js-revenue-tbody-item'),
			text = $el.text(),
			iconTpl = "<i class='fa js-icon'></i>",
			reports = w.adpushup.reports.config,
			variationName = $el.parentsUntil('tr').parent().find('> .js-variationName-tbody-item').text(),
			channelName = (reports.platform.toUpperCase() + ':' + reports.pageGroup.toUpperCase() + '_' + variationName),
			classNameConfig = {
				'icon': {
					'spinner': 'fa-cog fa-spin',
					'success': 'fa-check',
					'error': 'fa-close'
				},
				'btn': {
					'success': 'btn-success',
					'error': 'btn-error'
				}
			};

		paramConfig = {
			siteId: reports.siteId,
			channelName: channelName,
			endDate: reports.endDate,
			reportType: reports.reportType,
			startDate: reports.startDate,
			step: reports.step
		};

		if (!paramConfig) {
			return false;
		}

		$el
			.attr({'disabled': true})
			.html($(iconTpl))
				.find('.js-icon')
				.addClass(classNameConfig.icon.spinner)
				.end();

		function successCallback(data) {
			$el
				.addClass(classNameConfig.btn.success)
					.find('.js-icon')
					.removeClass(classNameConfig.icon.spinner)
					.addClass(classNameConfig.icon.success)
					.end();

			setTimeout(function() {
				$el
					.removeClass(classNameConfig.btn.success)
					.attr({'disabled': false})
						.find('.js-icon')
						.removeClass(classNameConfig.icon.success)
						.end()
					.remove();

				$parentEl.text(data.rpm);
				$pageViewsEl.text(data.pageViews);
				$revenueEl.text(data.earnings);
				calculatePageRPMPerformance($parentEl);
			}, 2000);
		}

		function errorCallback() {
			$el.addClass(classNameConfig.btn.error)
				.find('.js-icon')
				.removeClass(classNameConfig.icon.spinner)
				.addClass(classNameConfig.icon.error)
				.end();

			setTimeout(function() {
				$el
					.removeClass(classNameConfig.btn.error)
					.attr({'disabled': false})
						.find('.js-icon')
						.removeClass(classNameConfig.icon.error)
						.remove();

				$el.text(text);
			}, 2000);
		}

		getRPMData(paramConfig, {
			success: successCallback,
			error: errorCallback
		});
	}

	function getRPMData(paramsData, callbackConfig) {
		var url = '/data/getPageGroupVariationRPM',
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

	function updateTrafficDistributionUI() {
		var $trafficDistributionEls = $('#reports_table ._ap_table > tbody .js-traffic-tbody-item'),
			$tpl;

		$trafficDistributionEls.each(function(idx, el) {
			var $el = $(el), text = $el.text();
			$tpl = $("<div class='input-group js-input-group'><input type='text' class='form-control js-traffic-distribution-input' placeholder='b/w 0-100' aria-describedby='traffic-distribution'><div class='input-group-btn'><button class='btn btn-default js-traffic-distribution-btn' type='button'><i class='fa fa-save'></i></button></div></div>");

			$el
				.html($tpl)
				.find('.js-traffic-distribution-input')
				.val(text)
				.attr({
					'data-variation-key': $el.parent().find('.js-variationName-tbody-item').text()
				})
				.end();
		});
	}

	function initTDPopovers() {
		var $inputGroupEl = $('#reports_table ._ap_table .js-traffic-tbody-item .js-input-group'),
			popoverConfig = {
				'animation': true,
				'container': 'body',
				'content': 'Change text box value, press "Enter" key and click save button',
				'placement': 'left',
				'title': 'HOW TO USE',
				'trigger': 'hover'
			};

		$inputGroupEl.popover(popoverConfig);
	}

	function handleTDInputChange(e) {
		var $el = $(e.target),
			configs = w.adpushup.reports.config,
			trafficDistribution = $el.val(),
			variationName = ([configs.pageGroup.toUpperCase(), $el.attr('data-variation-key'), configs.platform.toUpperCase()]).join('_'),
			paramConfig = {
				'trafficDistribution': trafficDistribution,
				'variationName': variationName,
				'siteId': configs.siteId
			};

		$el.data('params', paramConfig);
	}

	function saveTDData(paramsData, callbackConfig) {
		var url = '/data/saveTrafficDistribution',
			type = 'POST';

		$.ajax({
			type: type,
			url: url,
			data: paramsData,
			dataType: 'json'
		}).done(function(data) {
			data = (typeof data === 'string') ? JSON.parse(data) : data;

			if (data.success) {
				return callbackConfig.success();
			}

			return callbackConfig.error();
		}).fail(function() {
			callbackConfig.error();
		});
	}

	function handleTDButtonClick(e) {
		var $el = $(e.target), $icon, paramConfig,
			classNameConfig = {
				'icon': {
					'orig': 'fa-save',
					'spinner': 'fa-cog fa-spin',
					'success': 'fa-check',
					'error': 'fa-close'
				},
				'btn': {
					'success': 'btn-success',
					'error': 'btn-error'
				}
			};

		$el = ($el.parent().hasClass('js-traffic-distribution-btn')) ? $el.parent() : $el;
		$icon = $el.find('.fa');
		paramConfig = $el.parentsUntil('.input-group').parent().find('.js-traffic-distribution-input').data('params');

		if (!paramConfig) {
			return false;
		}

		$el.attr({'disabled': true});
		$icon
			.removeClass(classNameConfig.icon.orig)
			.addClass(classNameConfig.icon.spinner);

		function successCallback() {
			$el.addClass(classNameConfig.btn.success);
			$icon
				.removeClass(classNameConfig.icon.spinner)
				.addClass(classNameConfig.icon.success);

			setTimeout(function() {
				$el
					.removeClass(classNameConfig.btn.success)
					.attr({'disabled': false});
				$icon
					.removeClass(classNameConfig.icon.success)
					.addClass(classNameConfig.icon.orig);
			}, 2000);
		}

		function errorCallback() {
			$el.addClass(classNameConfig.btn.error);
			$icon
				.removeClass(classNameConfig.icon.spinner)
				.addClass(classNameConfig.icon.error);

			setTimeout(function() {
				$el
					.removeClass(classNameConfig.btn.error)
					.attr({'disabled': false});
				$icon
					.removeClass(classNameConfig.icon.error)
					.addClass(classNameConfig.icon.orig);
			}, 2000);
		}

		saveTDData({data: JSON.stringify(paramConfig)}, {
			success: successCallback,
			error: errorCallback
		});
	}

	function setTDEventHandlers() {
		var $tdInputEls = $('#reports_table ._ap_table .js-traffic-distribution-input'),
			$tdBtnEls = $('#reports_table ._ap_table .js-traffic-distribution-btn');

		$tdInputEls.off('change').on('change', handleTDInputChange);
		$tdBtnEls.off('click').on('click', handleTDButtonClick);
	}

	return {
		'setData': function(apexData, dataTable) {
			setApexData(apexData);
			setDataTable(dataTable);
		},
		'getData': function() {
			return [_apexData, _dataTable];
		},
		'setClassNames': setClassNames,
		'updateTrafficDistributionUI': updateTrafficDistributionUI,
		'initTDPopovers': initTDPopovers,
		'setTDEventHandlers': setTDEventHandlers,
		'selectControlVariation': selectControlVariation,
		'updateTableSelectionUI': updateTableSelectionUI,
		'updateTableRPMUI': updateTableRPMUI,
		'calculatePageRPMPerformance': calculatePageRPMPerformance
	};
})(window, $);

window.ApexReport = ApexReport;
