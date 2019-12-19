var utils = require('../libs/utils'),
	w = window,
	$ = require('../libs/jquery');

function Control(controlCodeType) {
	var ads = [],
		err = [],
		i,
		j,
		k,
		ad,
		isControlActivated = false;

	(function hookAndfetchAllControlAds() {
		var controlElArray = controlCodeType === 'prebid' ? w.adpTags.control : w.adpushup.control;

		if (typeof controlElArray === 'object' && controlElArray instanceof Array) {
			for (i = 0, j = controlElArray, k = j[i]; i < j.length; k = j[++i]) {
				push(k);
			}
		}
	})();

	function push(el) {
		var adObj = {
			el: el,
			ac: el.getAttribute('data-ac'),
			id: '_ap_control_ad_' + (ads.length + 1),
			ver: el.getAttribute('data-ver'),
			siteId: el.getAttribute('data-siteId')
		};
		ads.push(adObj);
		if (isControlActivated) {
			activateAd(adObj);
		}
	}

	function placeAd(adObj) {
		if (adObj && adObj.el && adObj.ac) {
			var adCode = utils
				.base64Decode(adObj.ac)
				.replace('class="adsbygoogle"', 'class="adsbygoogle _ap_control_ad"');

			if (controlCodeType === 'prebid') {
				$('head').prepend(adCode);
			} else {
				$(adObj.el).before(adCode);
			}

			$(adObj.el).remove();
		}
	}

	function activateAd(adObj) {
		if (adObj.active) {
			return true;
		}

		try {
			$.ajaxSettings.cache = true;
			placeAd(adObj);
			$.ajaxSettings.cache = false;
			adObj.active = true;
		} catch (e) {
			err.push({ msg: 'Error in replaying ad.', adObj: adObj, error: e });
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
