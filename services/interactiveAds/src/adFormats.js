// Ad formats module

var commonConsts = require('./commonConsts'),
	adFormats = {
		sitckyFooter: function(size, adCode) {
			// Size is an array of format - [width, height]

			if (!adCode) {
				console.warn('No ad code provided in Sticky Footer format.');
				return;
			}

			if (!size || size.length !== 2) {
				console.warn('Size format is incorrect in Sticky Footer format, applying default size.');
				size = commonConsts.SIZES.STICKY_FOOTER;
			}

			var div = document.createElement('div');
			div.style.width = size[0];
			div.style.height = size[1];
			div.style.position = 'fixed';
			div.style.bottom = 0;
			div.style.margin = '0 auto';
			div.innerHTML = adCode;
			div.className = 'adp_ad';

			document.body.appendChild(div);
		}
	};

module.exports = adFormats;
