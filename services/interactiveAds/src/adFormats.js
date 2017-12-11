// Ad formats module

var commonConsts = require('./commonConsts'),
	utils = require('./utils'),
	checkAdFormat = function(format, size, adCode) {
		if (!adCode) {
			console.warn('No ad code provided in ' + format.NAME + ' format. Ad could not be created.');
			return false;
		}

		if (!size || size.length !== 2) {
			console.warn('Size format is incorrect in ' + format.NAME + ' format, applying default size.');
			size = format.SIZE;
		}

		return size;
	},
	adFormats = {
		createSitckyFooter: function(size, adCode) {
			var format = commonConsts.FORMATS.STICKY_FOOTER,
				formatSize = checkAdFormat(format, size, adCode);

			if (formatSize) {
				var styles = Object.assign(commonConsts.FORMATS.STICKY_FOOTER.STYLES, {
						width: formatSize[0],
						height: formatSize[1]
					}),
					attrs = {
						className: commonConsts.DEFAULT_FORMAT_CLASSNAME
					},
					stickyFooter = utils.createDOMNode('div', styles, attrs, adCode);

				document.body.appendChild(stickyFooter);
			}
		}
	};

module.exports = adFormats;
