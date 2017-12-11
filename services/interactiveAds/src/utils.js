// Common utilities

var commonConsts = require('./commonConsts'),
	utils = {
		createDOMNode: function(type, styles, attrs, innerHTML) {
			var node = document.createElement(type || commonConsts.DEFAULT_NODE_TYPE);

			for (var property in styles) {
				node.style[property] = styles[property];
			}

			for (var attr in attrs) {
				node[attr] = attrs[attr];
			}

			node.innerHTML = innerHTML;
			return node;
		}
	};

module.exports = utils;
