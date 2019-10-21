const $ = require('jquery');

const commonConsts = require('../config/commonConsts');

const getDockedCSS = function(formatData, elComputedStyles) {
	const computedStyles = {
		bottom: elComputedStyles.bottom,
		right: elComputedStyles.right,
		left: elComputedStyles.left,
		margin: elComputedStyles.margin
	};

	return formatData && formatData.css
		? $.extend({}, true, commonConsts.DOCKED_CSS, computedStyles, formatData.css, {
				position: 'fixed'
		  })
		: $.extend({}, true, commonConsts.DOCKED_CSS, computedStyles);
};

const getDockedOffset = function(formatData) {
	const bottomOffset = formatData && formatData.bottomOffset ? Number(formatData.bottomOffset) : 0;
	return formatData && formatData.bottomXPath
		? $(formatData.bottomXPath).offset().top - bottomOffset
		: null;
};

const dockifyAd = function(xPath, formatData, utils) {
	if (!xPath || !$(xPath).length) {
		return false;
	}

	const $el = $(xPath);

	const elComputedStyles = window.getComputedStyle($el[0]);

	const dockedCSS = getDockedCSS(formatData, elComputedStyles);

	const offset = getDockedOffset(formatData);

	let elTopOffset = $el.offset().top;

	const windowHeight = $(window).height();

	const dockifyTrigger = function() {
		const windowScrollTop = $(window).scrollTop();

		const scrollLimitReachedWithoutOffset = windowScrollTop > elTopOffset && !offset;

		const scrollLimitReachedWithOffset =
			windowScrollTop > elTopOffset && offset && windowScrollTop < offset;

		if (scrollLimitReachedWithoutOffset || scrollLimitReachedWithOffset) {
			$el.css(dockedCSS);
		} else {
			$el.css({
				position: 'relative',
				top: '',
				zIndex: ''
			});
		}

		if (offset && windowScrollTop + windowHeight > offset) {
			const resetTop = offset - (windowScrollTop + windowHeight);
			$el.css({
				position: 'fixed',
				top: resetTop, // This goes in negative as the offset is crossed
				zIndex: ''
			});
		}
	};

	const dockedAdOffsetInterval = setInterval(() => {
		elTopOffset = $el.offset().top;
	}, 500);

	$(window).on('load', () => {
		clearInterval(dockedAdOffsetInterval);
	});

	$(window).on(
		'scroll',
		utils.throttle(() => {
			dockifyTrigger();
		}, 10)
	);
};

module.exports = {
	dockifyAd,
	advanceDockify: {}
};
