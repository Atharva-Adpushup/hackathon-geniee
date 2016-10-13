var ApexReport = (function(w, $) {
	function cdfNorm(x) {
		var a = 0.0498673470,
			b = 0.0211410061,
			c = 0.0032776263,
			d = 0.0000380036,
			e = 0.0000488906,
			f = 0.0000053830,
			t = 1.0 + Math.abs(x) * (a + Math.abs(x) * (b + Math.abs(x) * (c + Math.abs(x) * (d + Math.abs(x) * (e + Math.abs(x) * f)))));
		t *= t;
		t *= t;
		t *= t;
		t *= t;
		t = 1.0 / (t + t);
		if (x >= 0) {
			t = 1 - t;
		}
		return t;
	}

	function calculateStatisticalSignificance(config) {
		var originalSessions = config.original.sessions,
			originalConversions = config.original.conversions,
			variantSessions = config.variant.sessions,
			variantConversions = config.variant.conversions,
			minimumSignificance = 95,
			originalMean, variantMean, pValue, stdError, zValue,
			computedConfig = {};

		if (isNaN(originalSessions) || isNaN(originalConversions) || isNaN(variantSessions) || isNaN(variantConversions)) {
			// throw new AdPushupError('Cannot compute significance, please enter only numbers!');
			return false;
		}
		if (originalConversions > originalSessions || variantConversions > variantSessions) {
			// throw new AdPushupError('The number of conversions cannot be greater than the number of sessions.');
			return false;
		}

		originalMean = originalConversions / originalSessions;
		variantMean = variantConversions / variantSessions;

		if (originalMean === variantMean) {
			pValue = 50;
		} else {
			stdError = Math.sqrt((originalMean * (1 - originalMean) / originalSessions) + (variantMean * (1 - variantMean) / variantSessions));
			zValue = (variantMean - originalMean) / stdError;
			pValue = parseInt(cdfNorm(zValue) * 1000, 10) / 10;
		}

		if (pValue > minimumSignificance) {
			computedConfig.perf = 'success';
		} else {
			computedConfig.perf = 'warning';
		}

		computedConfig.value = pValue;
		return computedConfig;
	}

	function selectControlVariation() {
		var $tbody = $('#reports_table ._ap_table').find('tbody'),
			$ctrEls = $tbody.find('tr > td:nth-child(6)'), $controlTr, ctrArr = [],
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
		var $rpmEls = $('#reports_table ._ap_table > tbody > tr > td:nth-child(8)'),
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
		var $selectionEls = $('#reports_table ._ap_table > tbody > tr > td:nth-child(1)'),
			$tpl,
			tooltipConfig = {
				animation: true,
				placement: 'top',
				title: 'Set as Control variation',
				trigger: 'hover'
			};

		$selectionEls.each(function(idx, el) {
			var $el = $(el);
			$tpl = $("<button id='selection-btn-" + idx + "' class='btn btn-default btn--icon js-selection-btn' type='button'></button>");

			$el
				.html($tpl)
				.find('.js-selection-btn')
				.tooltip(tooltipConfig)
				.end();

			setSelectionEventListeners();

			if ($el.parent().hasClass('selected')) {
				$el.find('.js-selection-btn').click();
			}
		});
	}

	function calculatePerformance($trEls, controlConfig) {
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
				$variationNameEl = $el.find('> td:nth-child(2)'),
				$pageViewsEl = $el.find('> td:nth-child(4)'),
				$clicksEl = $el.find('> td:nth-child(5)'),
				$ctrEl = $el.find('> td:nth-child(6)'),
				$perfEl = $el.find('> td:nth-child(7)'),
				perfValue = Math.round(((Number($ctrEl.text()) - controlConfig.ctr) / controlConfig.ctr) * 100),
				significanceData = calculateStatisticalSignificance({
					original: {
						sessions: controlConfig.pageViews,
						conversions: controlConfig.clicks
					},
					variant: {
						sessions: Number($pageViewsEl.text()),
						conversions: Number($clicksEl.text())
					}
				}),
				significanceStr = 'Variation ' + $variationNameEl.text() + ' is performing <b>' + (Math.abs(perfValue)).toString() + '%</b> ';

			performanceArr.push(perfValue);
			$perfEl.text(perfValue.toString());

			if (perfValue > 0) {
				significanceStr += 'better than control variation';
				popoverConfig.content = significanceStr;

				$perfEl
					.addClass('perf')
					.append($(config.icon.tpl.success))
					.find('.js-icon')
					.popover(popoverConfig)
					.end();

				// if (significanceData.perf === config.icon.str.success) {
				// 	$perfEl.addClass('perf--high');
				// } else {
				// 	$perfEl.addClass('perf--low');
				// }
			} else if (perfValue === 0) {
				$perfEl.addClass('perf perf--equal');
			} else {
				significanceStr += 'worse than control variation';
				popoverConfig.content = significanceStr;

				$perfEl
					.addClass('perf perf--lowest')
					.append($(config.icon.tpl.error))
					.find('.js-icon')
					.popover(popoverConfig)
					.end();
			}
		});
	}

	function calculateCTRPerformance($targetBtn) {
		var $targetTr = $targetBtn.parentsUntil('tr').parent(),
			$targetPageViewsTd = $targetTr.find(' > td:nth-child(4)'),
			$targetClicksTd = $targetTr.find(' > td:nth-child(5)'),
			$targetCTRTd = $targetTr.find(' > td:nth-child(6)'),
			$targetPerfTd = $targetTr.find(' > td:nth-child(7)'),
			targetConfig = {
				'pageViews': Number($targetPageViewsTd.text()),
				'clicks': Number($targetClicksTd.text()),
				'ctr': Number($targetCTRTd.text()),
				'$el': $targetCTRTd
			},
			$otherTrEls = $targetBtn.parentsUntil('tbody').parent().find('> tr').not($targetTr);

		$targetPerfTd.html('');
		return calculatePerformance($otherTrEls, targetConfig);
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
			};

		$el = ($el.parent().hasClass('js-selection-btn')) ? $el.parent() : $el;

		if ($el.hasClass(classNameConfig.btn.selected)) {
			return false;
		}

		$el
			.parentsUntil('tbody').parent()
				.find('tr')
				.removeClass(classNameConfig.btn.selected)
					.find('.js-selection-btn')
					.html('')
					.removeClass(classNameConfig.btn.selected)
					.end()
					.find('> td:nth-child(6) > .js-icon')
					.remove()
					.end()
					.find('> td:nth-child(7)')
					.removeClass('perf perf--high perf--equal perf--low perf--lowest')
						.find('> .js-icon')
						.remove()
						.end()
					.end();

		$el.addClass(classNameConfig.btn.selected)
			.html($(classNameConfig.icon.tpl))
			.parentsUntil('tr').parent()
			.addClass(classNameConfig.btn.selected)
				.find('> td:nth-child(6)')
				.append($(classNameConfig.icon.iconTpl))
					.find('.js-icon')
					.tooltip({
						animation: true,
						placement: 'right',
						title: 'This CTR is selected as Control CTR',
						trigger: 'hover'
					})
					.end()
				.end();

		calculateCTRPerformance($el);
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
			text = $el.text(),
			iconTpl = "<i class='fa js-icon'></i>",
			reports = w.adpushup.reports.config,
			variationName = $el.parentsUntil('tr').parent().find("> td:nth-child(2)").text(),
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

		function successCallback(rpmValue) {
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

				$parentEl.text(rpmValue);
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
				return callbackConfig.success(data.rpm);
			}

			return callbackConfig.error();
		}).fail(function() {
			callbackConfig.error();
		});
	}

	function updateTrafficDistributionUI() {
		var $trafficDistributionEls = $('#reports_table ._ap_table > tbody > tr > td:nth-child(3)'),
			$tpl;

		$trafficDistributionEls.each(function(idx, el) {
			var $el = $(el), text = $el.text();
			$tpl = $("<div class='input-group js-input-group'><input type='text' class='form-control js-traffic-distribution-input' placeholder='b/w 0-100' aria-describedby='traffic-distribution'><div class='input-group-btn'><button class='btn btn-default js-traffic-distribution-btn' type='button'><i class='fa fa-save'></i></button></div></div>");

			$el
				.html($tpl)
				.find('.js-traffic-distribution-input')
				.val(text)
				.attr({
					'data-variation-key': $el.prev().text()
				})
				.end();
		});
	}

	function initTDPopovers() {
		var $inputGroupEl = $('#reports_table ._ap_table .js-input-group'),
			popoverConfig = {
				'animation': true,
				'container': 'body',
				'content': 'Change text box value, press "Enter" key and click save button',
				'placement': 'right',
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
		'updateTrafficDistributionUI': updateTrafficDistributionUI,
		'initTDPopovers': initTDPopovers,
		'setTDEventHandlers': setTDEventHandlers,
		'selectControlVariation': selectControlVariation,
		'updateTableSelectionUI': updateTableSelectionUI,
		'updateTableRPMUI': updateTableRPMUI
	};
})(window, $);

window.ApexReport = ApexReport;
