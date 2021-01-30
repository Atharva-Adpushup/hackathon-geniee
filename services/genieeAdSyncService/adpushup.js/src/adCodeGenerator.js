var utils = require('../libs/utils'),
	$ = require('../libs/jquery'),
	config = window.adpushup.config,
	consts = require('../config/commonConsts'),
	generateGenieeBodyTag = function(ad) {
		var adCode,
			genieeRef = window.adpushup && window.adpushup.geniee,
			isSendBeforeBodyTags = genieeRef && genieeRef.sendBeforeBodyTagsFeedback,
			isGlobalADPTags = !!window.adpushup.config.isADPTags,
			isGenieeNetwork = !!(ad.network === 'geniee' && ad.networkData && ad.networkData.zoneId),
			isZoneContainerId = !!(isGenieeNetwork && ad.networkData.zoneContainerId),
			computedDFPAdUnitId = isZoneContainerId
				? ad.networkData.zoneContainerId
				: ad.networkData.dfpAdunit,
			computedSSPContainerId = isZoneContainerId
				? ad.networkData.zoneContainerId
				: ad.networkData.zoneId;

		computedSSPContainerId = '_ap_apexGeniee_ad_' + computedSSPContainerId;

		if (ad.networkData.adCode) {
			adCode = utils.base64Decode(ad.networkData.adCode);
		} else if (
			ad.network &&
			ad.network === 'geniee' &&
			ad.networkData &&
			ad.networkData.dynamicAllocation
		) {
			adCode = [];
			adCode.push('<div id="' + computedDFPAdUnitId + '">');
			adCode.push('<scr' + 'ipt type="text/javascript">');
			adCode.push('window.adpushup.adpTags.que.push(function(){');
			adCode.push('window.adpushup.adpTags.display("' + computedDFPAdUnitId + '");');
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
			adCode.push('gnsmod.displayAds("' + computedSSPContainerId + '");');
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
					var ad = adpTagUnits[i],
						isNetworkData = !!ad.networkData,
						networkData = isNetworkData && ad.networkData,
						//Geniee specific variables
						isResponsive = !!(networkData && networkData.isResponsive),
						isManual = !!ad.isManual,
						sectionName = ad.sectionName || null,
						adWidth = isResponsive ? ad.width : parseFloat(ad.width),
						adHeight = isResponsive ? ad.height : parseFloat(ad.height),
						defaultAdSizeArray = [adWidth, adHeight],
						isZoneContainerId = !!networkData.zoneContainerId,
						computedDFPAdUnitId = isZoneContainerId
							? networkData.zoneContainerId
							: networkData.dfpAdunit,
						formats = networkData && networkData.formats,
						adType = (ad.formatData && ad.formatData.type) || null,
						sizeMapping = ad.sizeMapping || [],
						downwardSizesDisabled = !!ad.downwardSizesDisabled;
					window.adpushup.utils.log({ ad });
					window.adpushup.adpTags.defineSlot(
						computedDFPAdUnitId,
						defaultAdSizeArray,
						computedDFPAdUnitId,
						{
							originalId: ad.originalId,
							dfpAdunit: networkData.dfpAdunit,
							dfpAdunitCode: networkData.dfpAdunitCode,
							headerBidding: window.adpushup.services.HB_ACTIVE && networkData.headerBidding,
							keyValues: networkData.keyValues,
							network: ad.network,
							formats: formats,
							enableLazyLoading: networkData.enableLazyLoading,
							overrideActive: networkData.overrideActive,
							overrideSizeTo: networkData.overrideSizeTo,
							isResponsive: isResponsive,
							isManual: isManual,
							sectionName: sectionName,
							adId: ad.id,
							services: ad.services,
							refreshInterval: networkData.refreshInterval || consts.AD_REFRESH_INTERVAL / 1000,
							fluid: ad.fluid,
							adType: adType,
							sizeMapping: sizeMapping,
							downwardSizesDisabled,
							sizeFilters: ad.sizeFilters
						}
					);
				}
				//Extend variation wise keyvalues if any for adpTags. These will be page level targeting keys
				if (adpKeyValues && Object.keys(adpKeyValues).length) {
					var keyVals = window.adpushup.adpTags.config.PAGE_KEY_VALUES;
					window.adpushup.adpTags.extendConfig({
						PAGE_KEY_VALUES: Object.assign(keyVals, adpKeyValues)
					});
				}
			};
		};
		window.adpushup.adpTags = window.adpushup.adpTags || {};
		window.adpushup.adpTags.que = window.adpushup.adpTags.que || [];
		window.adpushup.adpTags.que.push(doIt(adpTagUnits));
		return true;
	},
	executeAmpHeadCode = function() {
		var adCode = [];
		adCode.push(
			'<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">'
		);
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
	executeMediaNetHeadCode = function() {
		var adCode = [];
		var cid = window.adpushup.config.medianetId || consts.ADPUSHUP_MEDIANET_ID;
		adCode.push('<scr' + 'ipt type="text/javascript">');
		adCode.push('window._mNHandle = window._mNHandle || {};');
		adCode.push('window._mNHandle.queue = window._mNHandle.queue || [];');
		adCode.push('medianet_versionId = "3121199";');
		adCode.push('</scr' + 'ipt>');
		adCode.push(
			'<scr' + 'ipt async  src="//contextual.media.net/dmedianet.js?cid=' + cid + '"></scr' + 'ipt>'
		);
		var $el = null;
		if ($('head').length) {
			$el = $('head');
		} else {
			$el = $('body');
		}
		$el.append(adCode.join('\n'));
		return true;
	},
	genrateAdpBodyTag = function(ad) {
		var adCode,
			isZoneContainerId = !!ad.networkData.zoneContainerId,
			computedDFPAdUnitId = isZoneContainerId
				? ad.networkData.zoneContainerId
				: ad.networkData.dfpAdunit;
		if (!ad.networkData || !ad.networkData.dfpAdunit) {
			adCode = '';
		} else if (config.serveAmpTagsForAdp) {
			//serve amp tags here
			adCode = [];
			adCode.push('<amp-ad width=' + ad.width + ' height=' + ad.height);
			adCode.push('type="doubleclick"');
			adCode.push('data-slot="/103512698/' + computedDFPAdUnitId + '"');
			adCode.push('data-multi-size-validation="false">');
			adCode.push('</amp-ad>');
			if (ad.networkData.isSticky) {
				adCode.push('</amp-sticky-ad>');
				adCode.unshift('<amp-sticky-ad layout="nodisplay">');
			}
		} else {
			adCode = [];
			var adpTags = window.adpushup.adpTags;
			if (document.getElementById(computedDFPAdUnitId) && adpTags) {
				var slot = adpTags.adpSlots && adpTags.adpSlots[computedDFPAdUnitId];
				if (slot && slot.hasRendered && slot.gSlot) {
					googletag && googletag.pubads().refresh([slot.gSlot]);
				} else {
					adpTags.display(computedDFPAdUnitId);
				}
			} else {
				adCode.push(
					'<div id="' + computedDFPAdUnitId + '" style="text-align: center; margin: 0 auto;">'
				);
				adCode.push('<scr' + 'ipt type="text/javascript">');
				adCode.push('window.adpushup.adpTags.que.push(function(){');
				adCode.push('window.adpushup.adpTags.display("' + computedDFPAdUnitId + '");');
				adCode.push('});');
				adCode.push('</scr' + 'ipt>');
				adCode.push('</div>');
			}
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
	generateGenieeHeaderCode: function(genieeIdCollection) {
		if (!genieeIdCollection || !genieeIdCollection.length) {
			return false;
		}

		var adCode = [],
			i,
			iteratorObject,
			containerId,
			zoneId;

		adCode.push('<scr' + 'ipt type="text/javascript">');
		adCode.push('var gnsmod = gnsmod || {};');
		adCode.push('gnsmod.cmd = gnsmod.cmd || [];');
		adCode.push('gnsmod.cmd.push(function() {');
		for (i = 0; i < genieeIdCollection.length; i++) {
			iteratorObject = genieeIdCollection[i];
			containerId = iteratorObject.zoneContainerId || iteratorObject.zoneId;
			containerId = '_ap_apexGeniee_ad_' + containerId;
			zoneId = iteratorObject.zoneId;

			adCode.push('gnsmod.defineZone("' + containerId + '", ' + zoneId + ');');
		}
		adCode.push('gnsmod.fetchAds();');
		adCode.push('});');
		adCode.push('</scr' + 'ipt>');
		adCode.push(
			' <scr' +
				'ipt async type="text/javascript"\n src="//js.gsspcln.jp/l/gnsmod.min.js"> \n</scr' +
				'ipt>'
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
	},
	generateMediaNetHeadCode: function() {
		return executeMediaNetHeadCode();
	},
	generatePoweredByBanner(id, styles) {
		const { POWERED_BY_BANNER } = consts;
		const $banner = $('<a />');
		const $logo = $('<img />');
		$logo
			.attr({
				alt: 'AdPushup',
				src: POWERED_BY_BANNER.IMAGE
			})
			.css({ ...POWERED_BY_BANNER.CSS.LOGO });

		return $banner
			.attr({
				href: POWERED_BY_BANNER.REDIRECT_URL,
				target: '_blank',
				class: 'powered-by-banner',
				id: `banner-${id}`
			})
			.css({ ...POWERED_BY_BANNER.CSS.COMMON, ...styles })
			.append($logo);
	}
};
