var $ = require('jquery'),
	commonConsts = require('../config/commonConsts'),
	getDockedCSS = function (formatData, elComputedStyles) {
		var computedStyles = {
			bottom: elComputedStyles.bottom,
			right: elComputedStyles.right,
			left: elComputedStyles.left,
			margin: elComputedStyles.margin
		};

		return formatData && formatData.css
			? $.extend({}, true, commonConsts.DOCKED_CSS, computedStyles, formatData.css, { position: 'fixed' })
			: $.extend({}, true, commonConsts.DOCKED_CSS, computedStyles);
	},
	getDockedOffset = function (formatData) {
		var bottomOffset = formatData && formatData.bottomOffset ? Number(formatData.bottomOffset) : 0;
		var bottomXPath = formatData ? formatData.bottomXpath || formatData.bottomXPath : null;
		return bottomXPath ? $(bottomXPath).offset().top - bottomOffset : null;
	},
	dockifyAd = function (xPath, formatData, utils) {
		if (!xPath || !$(xPath).length) {
			return false;
		}

		var $el = $(xPath);
		var elComputedStyles = window.getComputedStyle($el[0]);
		var dockedCSS = getDockedCSS(formatData, elComputedStyles);
		var windowHeight = $(window).height();

		var dockifyTrigger = function () {
			var windowScrollTop = $(window).scrollTop();
			var fixedPoint = $el.attr('data-fixed-point') || null;
			var elTopOffset = fixedPoint || $el.offset().top;
			var offset = $el.attr('data-bottom-offset') || null;
			if (!offset) {
				offset = getDockedOffset(formatData);
				$el.attr('data-bottom-offset', offset);
			}
			
			var scrollLimitReachedWithoutOffset = windowScrollTop > elTopOffset && !offset;
			var scrollLimitReachedWithOffset = windowScrollTop > elTopOffset && offset && windowScrollTop < offset;

			if (scrollLimitReachedWithoutOffset || scrollLimitReachedWithOffset) {
				$el.attr('data-fixed-point', elTopOffset);
				$el.css(dockedCSS);
			} else {
				$el.css({
					position: 'relative',
					top: '',
					zIndex: ''
				});
			}

			if (offset && windowScrollTop + windowHeight > offset) {
				var resetTop = offset - (windowScrollTop + windowHeight);
				$el.css({
					position: 'fixed',
					top: resetTop, // This goes in negative as the offset is crossed
					zIndex: ''
				});
			}
		};

		// var dockedAdOffsetInterval = setInterval(function () {
		// 	elTopOffset = $el.offset().top;
		// }, 1000);

		// $(window).on('load', function () {
		// 	clearInterval(dockedAdOffsetInterval);
		// });

		$(window).on(
			'scroll',
			utils.throttle(function () {
				dockifyTrigger();
			}, 10)
		);
	};

module.exports = {
	dockifyAd: dockifyAd,
	advanceDockify: {}
};
