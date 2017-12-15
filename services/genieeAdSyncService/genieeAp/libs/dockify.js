var $ = require('jquery'),
	dockedCss = {
		position: 'fixed',
		top: '0px',
		'z-index': 10000
	},
	dockifyAd = function(xPath, formatData) {
		var css = $.extend({}, true, dockedCss, formatData.css ? formatData.css : {}),
			offset = $(formatData.bottomXPath).offset().top;

		if (!xPath || !$(xPath).length) {
			return false;
		}

		var $el = $(xPath),
			elTopOffset = $el.offset().top;

		$(window).on('scroll', function() {
			var windowScrollTop = $(window).scrollTop(),
				windowHeight = $(window).height();

			if ($(window).scrollTop() > elTopOffset && $(window).scrollTop() < offset) {
				$el.css(css);
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
