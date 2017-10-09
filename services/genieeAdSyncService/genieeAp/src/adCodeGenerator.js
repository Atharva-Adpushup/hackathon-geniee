var utils = require('../libs/utils');

module.exports = {
	generateAdCode: function(ad) {
		var adCode;
		switch (ad.network.toLowerCase()) {
			case 'custom':
				adCode = utils.base64Decode(ad.adCode);
				break;

			case 'geniee':
				if (ad.adCode) {
					adCode = utils.base64Decode(ad.adCode);
				} else {
					adCode = [];
					adCode.push('<scr' + 'ipt type="text/javascript">');
					adCode.push('gnsmod.cmd.push(function() {');
					adCode.push('gnsmod.displayAds("_ap_apexGeniee_ad_' + ad.networkData.zoneId + '");');
					adCode.push('});');
					adCode.push('</scr' + 'ipt>');
				}
			case 'adptags':
				if (!ad.networkData || !ad.networkData.dfpAdunit) {
					adCode = '';
				} else {
					adCode = [];
					adCode.push('<div id="' + ad.networkData.dfpAdunit + '">');
					adCode.push('<scr' + 'ipt type="text/javascript">');
					adCode.push('window.adpTags.que.push(function(){');
					adCode.push('window.adpTags.display("' + ad.networkData.dfpAdunit + '");');
					adCode.push('});');
					adCode.push('</scr' + 'ipt>');
					adCode.push('</div>');
				}
				break;

			default:
				return false;
		}
		return typeof adCode === 'string' ? adCode : adCode.join('\n');
	},
	generateGenieeHeaderCode: function(genieeAdIds) {
		if (!genieeAdIds || !genieeAdIds.length) {
			return false;
		}
		var adCode = [],
			i;
		adCode.push('<scr' + 'ipt type="text/javascript">');
		adCode.push('var gnsmod = gnsmod || {};');
		adCode.push('gnsmod.cmd = gnsmod.cmd || [];');
		adCode.push('gnsmod.cmd.push(function() {');
		for (i = 0; i < genieeAdIds.length; i++) {
			adCode.push('gnsmod.defineZone("_ap_apexGeniee_ad_' + genieeAdIds[i] + '", ' + genieeAdIds[i] + ');');
		}
		adCode.push('gnsmod.fetchAds();');
		adCode.push('});');
		adCode.push('</scr' + 'ipt>');
		adCode.push(
			' <scr' + 'ipt async type="text/javascript"\n src="http://js.gsspcln.jp/l/gnsmod.min.js"> \n</scr' + 'ipt>'
		);
		return adCode.join('\n');
	},
	executeAdpTagsCode: function(adpTagUnits) {
		if (!adpTagUnits || !adpTagUnits.length) {
			return false;
		}
		var doIt = function(adpTagUnits) {
			return function() {
				for (var i = 0; i < adpTagUnits.length; i++) {
					var ad = adpTagUnits[i];
					adpTags.defineSlot(ad.networkData.dfpAdunit, [ad.width, ad.height], ad.networkData.dfpAdunit, {
						dfpAdunit: ad.networkData.dfpAdunit,
						dfpAdunitCode: ad.networkData.dfpAdunitCode,
						headerBidding: ad.networkData.headerBidding,
						priceFloor: ad.networkData.priceFloor
					});
				}
			};
		};
		window.adpTags = window.adpTags || {};
		window.adpTags.que = window.adpTags.que || [];
		window.adpTags.que.push(doIt(adpTagUnits));
		return true;
	}
};
