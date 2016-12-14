var utils = require('../libs/utils');

module.exports = {
	generateAdCode: function(ad) {
		var adCode;
		switch (ad.network.toLowerCase()) {
			case 'custom':
				adCode = utils.base64Decode(ad.adCode);
				break;

			case 'geniee':
				if(ad.adCode) {
					adCode = utils.base64Decode(ad.adCode);
				}
				else {
					adCode = [];
					adCode.push('<scr' + 'ipt type="text/javascript">');
					adCode.push('gnsmod.cmd.push(function() {');
					adCode.push('gnsmod.displayAds("_ap_apexGeniee_ad_' + ad.networkData.zoneId + '");');
					adCode.push('});');
					adCode.push('</scr' + 'ipt>');
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
		var adCode = [], i;
		adCode.push('<scr' + 'ipt type="text/javascript">');
		adCode.push('var gnsmod = gnsmod || {};');
		adCode.push('gnsmod.cmd = gnsmod.cmd || [];');
		adCode.push('gnsmod.cmd.push(function() {');
		for (i = 0; i < genieeAdIds.length; i++ ) {
			adCode.push('gnsmod.defineZone("_ap_apexGeniee_ad_' + genieeAdIds[i] + '", ' + genieeAdIds[i] + ');');
		}
		adCode.push('gnsmod.fetchAds();');
		adCode.push('});');
		adCode.push('</scr' + 'ipt>');
		adCode.push(' <scr' + 'ipt async type="text/javascript"\n src="http://other.geniee.jp/test/sample_html/adp/gnsmod.min.js"> \n</scr' + 'ipt>');
		return adCode.join('\n');
	}
};
