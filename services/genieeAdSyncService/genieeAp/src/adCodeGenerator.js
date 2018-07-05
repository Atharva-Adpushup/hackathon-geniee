var utils = require('../libs/utils'),
	$ = require('jquery'),
	config = window.adpushup.config,
	generateGenieeBodyTag = function(ad) {
		var adCode,
			genieeRef = window.adpushup && window.adpushup.geniee,
			isSendBeforeBodyTags = genieeRef && genieeRef.sendBeforeBodyTagsFeedback,
			isGlobalADPTags = !!window.adpushup.config.isADPTags;

		if (ad.networkData.adCode) {
			adCode = utils.base64Decode(ad.networkData.adCode);
		} else if (ad.network && ad.network == 'geniee' && ad.networkData && ad.networkData.dynamicAllocation) {
			adCode = [];
			adCode.push('<div id="' + ad.networkData.dfpAdunit + '">');
			adCode.push('<scr' + 'ipt type="text/javascript">');
			adCode.push('window.adpTags.que.push(function(){');
			adCode.push('window.adpTags.display("' + ad.networkData.dfpAdunit + '");');
			adCode.push('});');
			adCode.push('</scr' + 'ipt>');
			adCode.push('</div>');
		} else {
			//Check for geniee 'notifyBeforeBodyTags' function
			//This is done for Geniee-without-DFP tags integration
			//'isGlobalADPTags' checks whether any ADP tag is globally present or not
			if (!isGlobalADPTags && isSendBeforeBodyTags) {
				genieeRef.sendBeforeBodyTagsFeedback();
				if (!genieeRef.hasBodyTagsRendered) {
					genieeRef.hasBodyTagsRendered = true;
				}
			}

			adCode = [];
			adCode.push('<scr' + 'ipt type="text/javascript">');
			adCode.push('gnsmod.cmd.push(function() {');
			adCode.push('gnsmod.displayAds("_ap_apexGeniee_ad_' + ad.networkData.zoneId + '");');
			adCode.push('});');
			adCode.push('</scr' + 'ipt>');
		}
		return adCode;
	},
	executeNoramlAdpTagsHeadCode = function(adpTagUnits, adpKeyValues) {
		if (!adpTagUnits || !adpTagUnits.length) {
			return false;
		}
		var doIt = function(adpTagUnits) {
			return function() {
				for (var i = 0; i < adpTagUnits.length; i++) {
					var ad = adpTagUnits[i];
					adpTags.defineSlot(
						ad.networkData.dfpAdunit,
						[Number(ad.width), Number(ad.height)],
						ad.networkData.dfpAdunit,
						{
							dfpAdunit: ad.networkData.dfpAdunit,
							dfpAdunitCode: ad.networkData.dfpAdunitCode,
							headerBidding: ad.networkData.headerBidding,
							keyValues: ad.networkData.keyValues,
							network: ad.network,
							refreshSlot: ad.networkData.refreshSlot,
							overrideActive: ad.networkData.overrideActive,
							overrideSizeTo: ad.networkData.overrideSizeTo
						}
					);
				}
				//Extend variation wise keyvalues if any for adpTags. These will be page level targeting keys
				if (adpKeyValues && Object.keys(adpKeyValues).length) {
					var keyVals = adpTags.config.PAGE_KEY_VALUES;
					adpTags.extendConfig({ PAGE_KEY_VALUES: Object.assign(keyVals, adpKeyValues) });
				}
			};
		};
		window.adpTags = window.adpTags || {};
		window.adpTags.que = window.adpTags.que || [];
		window.adpTags.que.push(doIt(adpTagUnits));
		return true;
	},
	executeAmpHeadCode = function() {
		var adCode = [];
		adCode.push('<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">');
		adCode.push(
			'<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>'
		);
		adCode.push('<scr' + 'ipt async src="https://cdn.ampproject.org/v0.js"></scr' + 'ipt>');
		adCode.push(
			'<scr' +
				'ipt async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"></scr' +
				'ipt>'
		);
		adCode.push(
			'<scr' +
				'ipt async custom-element="amp-sticky-ad" src="https://cdn.ampproject.org/v0/amp-sticky-ad-1.0.js"></scr' +
				'ipt>'
		);
		$el = null;
		if ($('head').length) {
			$el = $('head');
		} else {
			$el = $('body');
		}
		$el.append(adCode.join('\n'));
		return true;
	},
	genrateAdpBodyTag = function(ad) {
		var adCode;
		if (!ad.networkData || !ad.networkData.dfpAdunit) {
			adCode = '';
		} else if (config.serveAmpTagsForAdp) {
			//serve amp tags here
			adCode = [];
			adCode.push('<amp-ad width=' + ad.width + ' height=' + ad.height);
			adCode.push('type="doubleclick"');
			adCode.push('data-slot="/103512698/' + ad.networkData.dfpAdunit + '"');
			adCode.push('data-multi-size-validation="false">');
			adCode.push('</amp-ad>');
			if (ad.networkData.isSticky) {
				adCode.push('</amp-sticky-ad>');
				adCode.unshift('<amp-sticky-ad layout="nodisplay">');
			}
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
		return adCode;
	};

module.exports = {
	generateAdCode: function(ad) {
		var adCode = '';
		if (!ad.networkData && ad.adCode) {
			return utils.base64Decode(ad.adCode);
		}
		switch (ad.network.toLowerCase()) {
			case 'geniee':
				adCode = generateGenieeBodyTag(ad);
				break;

			case 'adptags':
				adCode = genrateAdpBodyTag(ad);
				break;

			default:
				if (ad.networkData.adCode) {
					adCode = utils.base64Decode(ad.networkData.adCode);
				} else {
					return false;
				}
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
			' <scr' + 'ipt async type="text/javascript"\n src="//js.gsspcln.jp/l/gnsmod.min.js"> \n</scr' + 'ipt>'
		);
		return adCode.join('\n');
	},
	executeAdpTagsHeadCode: function(adpTagUnits, adpKeyValues) {
		if (config.serveAmpTagsForAdp) {
			executeAmpHeadCode();
		} else {
			executeNoramlAdpTagsHeadCode(adpTagUnits, adpKeyValues);
		}

		return true;
	}
};
