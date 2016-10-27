module.exports = {
	generateAdCode: function(adNetwork, adConfig, pageUrl) {
		var adCode;
		switch (adNetwork.toLowerCase()) {
			case 'adsense':
				if (adConfig.adslot) {
					adCode = [];

					adCode.push('<scr' + 'ipt type="text/javascript"><!--');
					adCode.push('google_ad_client = "' + adConfig.pubId + '"; \n /* ' + adConfig.adslot + ' */ \n google_ad_slot = "' + adConfig.adslot + '";');
					adCode.push('google_ad_width = "' + adConfig.width + '"; \n google_ad_height = "' + adConfig.height + '"; \n//-->');
					adCode.push('google_page_url = "' + pageUrl + '"; \n//-->');
					adCode.push('</scr' + 'ipt>\n <scr' + 'ipt type="text/javascript"\n src="//pagead2.googlesyndication.com/pagead/show_ads.js"> \n</scr' + 'ipt>');
				}
				break;
			default:
				return false;
		}
		return typeof adCode === 'string' ? adCode : adCode.join('\n');
	}
};
