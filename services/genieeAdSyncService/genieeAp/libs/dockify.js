var $ = require('jquery'),
	commonConsts = require('../config/commonConsts'),
	getDockedCSS = function(formatData, elComputedStyles) {
		var computedStyles = {
			bottom: elComputedStyles.bottom,
			right: elComputedStyles.right,
			left: elComputedStyles.left,
			margin: elComputedStyles.margin
		};

		return formatData && formatData.css
			? $.extend({}, true, commonConsts.DOCKED_CSS, computedStyles, formatData.css)
			: $.extend({}, true, commonConsts.DOCKED_CSS, computedStyles);
	},
	getDockedOffset = function(formatData) {
		return formatData && formatData.bottomXPath ? $(formatData.bottomXPath).offset().top : null;
	},
	dockifyAd = function(xPath, formatData) {
		if (!xPath || !$(xPath).length) {
			return false;
		}

		var $el = $(xPath),
			elComputedStyles = window.getComputedStyle($el[0]),
			dockedCSS = getDockedCSS(formatData, elComputedStyles),
			offset = getDockedOffset(formatData),
			elTopOffset = $el.offset().top,
			windowHeight = $(window).height();

		$(window).on('scroll', function() {
			var windowScrollTop = $(window).scrollTop(),
				scrollLimitReachedWithoutOffset = windowScrollTop > elTopOffset && !offset,
				scrollLimitReachedWithOffset = windowScrollTop > elTopOffset && offset && windowScrollTop < offset;

			if (scrollLimitReachedWithoutOffset || scrollLimitReachedWithOffset) {
				$el.css(dockedCSS);
			} else {
				$el.css({
					position: '',
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
		});
	};

module.exports = {
	dockifyAd: dockifyAd,
	advanceDockify: {}
};
