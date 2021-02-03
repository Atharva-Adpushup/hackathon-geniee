var adp = window.adpushup,
	commonConsts = require('../config/commonConsts'),
	getDockedCSS = function (formatData, elComputedStyles) {
		var computedStyles = {
			bottom: elComputedStyles.bottom,
			right: elComputedStyles.right,
			left: elComputedStyles.left,
			margin: elComputedStyles.margin
		};

		return formatData && formatData.css
			? adp.$.extend({}, true, commonConsts.DOCKED_CSS, computedStyles, formatData.css, { position: 'fixed' })
			: adp.$.extend({}, true, commonConsts.DOCKED_CSS, computedStyles);
	},
	getDockedOffset = function (formatData) {
		var bottomOffset = formatData && formatData.bottomOffset ? parseFloat(formatData.bottomOffset) : 0;
		var bottomXPath = formatData ? formatData.bottomXpath || formatData.bottomXPath : null;
		return bottomXPath ? adp.$(bottomXPath).offset().top - bottomOffset : null;
	},
	dockifyAd = function (xPath, formatData, utils) {
		if (!xPath || !adp.$(xPath).length) {
			return false;
		}

		var $el = adp.$(xPath);
		var elComputedStyles = window.getComputedStyle($el[0]);
		var dockedCSS = getDockedCSS(formatData, elComputedStyles);
		var adWidth = $el.width();
		var adHeight = $el.height();
		$el.parent().width(adWidth);
		$el.parent().height(adHeight);
		
		var dockifyTrigger = function () {
			var windowScrollTop = adp.$(window).scrollTop();
			var elTopOffset = $el.parent().offset().top;
			var offset = getDockedOffset(formatData);

			var scrollLimitReachedWithoutOffset = windowScrollTop > elTopOffset && !offset;
			var scrollLimitReachedWithOffset = windowScrollTop > elTopOffset && offset && windowScrollTop < offset;

			if (scrollLimitReachedWithoutOffset || scrollLimitReachedWithOffset) {
				$el.css(dockedCSS);
			} else {
				$el.css({
					position: 'relative',
					top: '',
					zIndex: ''
				});
			}

			if (offset && windowScrollTop + adHeight > offset) {
				var resetTop = offset - (windowScrollTop + adHeight);
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

		adp.$(window).on(
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
