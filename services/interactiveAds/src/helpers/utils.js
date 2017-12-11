var commonConsts = require('../commonConsts'),
	utils = {
		createDOMNode: function(styles, attrs, innerHTML) {
			var $node = $('<div/>')
				.css(styles)
				.attr(attrs)
				.html(innerHTML);

			return $node;
		}
	};

module.exports = utils;
