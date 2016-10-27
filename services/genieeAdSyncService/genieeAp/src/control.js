var utils = require('../libs/utils'),
	w = window,
	$ = require('jquery');

function Control() {
	var ads = [], err = [],
		i, j, k, ad, isControlActivated = false;

	(function hookAndfetchAllControlAds() {
		if (typeof w.adpushup.control === 'object' && w.adpushup.control instanceof Array) {
			for (i = 0, j = w.adpushup.control, k = j[i]; i < j.length; k = j[++i]) {
				push(k);
			}
		}
	})();

	function push(el) {
		var adObj = {
			'el': el,
			'ac': el.getAttribute('data-ac'),
			'id': '_ap_control_ad_' + (ads.length + 1),
			'ver': el.getAttribute('data-ver'),
			'siteId': el.getAttribute('data-siteId')
		};
		ads.push(adObj);
		if (isControlActivated) {
			activateAd(adObj);
		}
	}

	function activateAd(adObj) {
		if (adObj.active) {
			return true;
		}

		var container = $('<div/>').css({
			'display': 'block'
		}).attr({'id': adObj.id, 'class': '_ap_control_ad'});

		$(adObj.el).html(container);

		try {
			$.ajaxSettings.cache = true;
			container.append(utils.base64Decode(adObj.ac));
			$.ajaxSettings.cache = false;
			adObj.active = true;
		} catch (e) {
			err.push({msg: 'Error in replaying ad.', adObj: adObj, error: e});
		}
	}

	function trigger() {
		isControlActivated = true;
		for (i = 0, j = ads, ad = j[i]; i < j.length; ad = j[++i]) {
			activateAd(ad);
		}
	}


	return {
		trigger: trigger,
		push: push
	};
}

module.exports = Control;

