const PLATFORMS = [
	{
		name: 'Desktop',
		image: '/assets/images/tagManager/devices/desktop.png',
		key: 'desktop'
	},
	{
		name: 'Mobile',
		image: '/assets/images/tagManager/devices/smartphone.png',
		key: 'mobile'
	}
];
const TYPES = [
	{
		name: 'Display (Text / Image)',
		image: '/assets/images/tagManager/display.png',
		key: 'display',
		description:
			'A simple way to get ads on your page. Select size, generate code and you are good to go'
	},
	{
		name: 'Native',
		image: '/assets/images/tagManager/native.png',
		key: 'native',
		description:
			'Ads that flow seamlessly inside a list of articles or products on your site, offering a great user experience'
	},
	{
		name: 'Links',
		image: '/assets/images/tagManager/links.png',
		key: 'links',
		description: 'Link units display a list of topics that are relevant to the content of your page'
	},
	{
		name: 'Rewarded Ads',
		image: '/assets/images/tagManager/rewardedAds.png',
		key: 'rewardedAds',
		description:
			'High value video ads that may be watched by visitors in exchange for access to premium content'
	}
];
const SIZES = {
	DISPLAY: {
		ALLOWED: ['responsive', 'desktop', 'mobile'],
		DESKTOP: [
			'970x250',
			'970x90',
			'728x250',
			'728x90',
			'468x60',
			'336x280',
			'320x50',
			'300x600',
			'300x100',
			'250x250',
			'240x240',
			'234x60',
			'200x200',
			'180x150',
			'160x600',
			'120x600',
			'120x240',
			'300x250'
		],
		MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
	},
	NATIVE: {
		ALLOWED: ['desktop', 'mobile'],
		DESKTOP: [
			'970x250',
			'970x90',
			'728x250',
			'728x90',
			'468x60',
			'336x280',
			'320x50',
			'300x600',
			'300x100',
			'250x250',
			'240x240',
			'234x60',
			'200x200',
			'180x150',
			'160x600',
			'120x600',
			'120x240',
			'300x250'
		],
		MOBILE: ['320x50', '300x250', '250x250', '200x200', '320x100', '336x280']
	},
	LINKS: {
		ALLOWED: ['responsive', 'desktop', 'mobile'],
		DESKTOP: ['336x280', '120x600', '1070x250', '320x100', '336x280', '300x250', '468x60'],
		MOBILE: ['320x100', '336x280', '300x250', '468x60']
	},
	REWARDEDADS: {
		ALLOWED: ['mobile']
	}
};

const CUSTOM_FIELDS = [
	{
		displayName: 'Max Height',
		key: 'maxHeight',
		inputType: 'number',
		placeholder: '',
		isRequired: false,
		attributes: { min: 50, max: 1050 },
		validationMessage: 'Max Size should be from 50 to 1050'
	}
];

const CUSTOM_FIELD_DEFAULT_VALUE = {
	NUMBER: null,
	STRING: ''
};

const DISPLAY_AD_MESSAGE = `<ol style="font-size: 15px;">
	<li style="margin-bottom: 10px;"><a href="/sites/__SITE_ID__/settings">AdPushup head code</a> needs to be present in the global head of your website.</li>
	<li style="margin-bottom: 10px;"><a href="/adsTxtManagement">Ads.txt</a>  is mandatory. It needs to be updated incase you already have one. Else please follow the instructions provided here: <a href="https://support.google.com/admanager/answer/7441288?hl=en" target="_blank">https://support.google.com/admanager/answer/7441288?hl=en</a>. AdPushup's ads.txt should be appended alongside your existing partners.</li>
	<li style="margin-bottom: 10px;" class="u-text-red u-text-bold">Please wait for 24-48 working hours for our operations team to review and approve the website. You'll start seeing the ads after our confirmation mail on the registered email ID. For any query please write to us at support@adpushup.com</li>
</ol>`;
const AMP_MESSAGE =
	'AMP adcode will be sent to your registered e-mail address by your account manager';
const ADCODE = `<div id="__AD_ID__" class="_ap_apex_ad"__CUSTOM_ATTRIBS__>
	<script>
		var adpushup = window.adpushup = window.adpushup || {};
		adpushup.que = adpushup.que || [];
		adpushup.que.push(function() {
			adpushup.triggerAd("__AD_ID__");
		});
	</script>
</div>`;

/** ************* 
      This function implements rejected logic of Rewarded Video Ads and displays ads after 1 week.
      function isResetRejectedFinal() {
				return true;
				var rewardedData = JSON.parse(localStorage.getItem('aprewarded_key'));
				if (!rewardedData.rejectedFinal) return true;
				if (!rewardedData.expiryDate) {
					rewardedData.expiryDate = new Date(new Date().getTime() + 604800000);
					localStorage.setItem('aprewarded_key', JSON.stringify(rewardedData));
					return true;
				}
				if (new Date().getTime() > new Date(rewardedData.expiryDate)) {
					rewardedData.expiryDate = undefined;
					rewardedData.rejectedFinal = false;
					localStorage.setItem('aprewarded_key', JSON.stringify(rewardedData));
					return true;
				}
				return false;
			}

			Feedback Code for Rewarded Video Ads
			function sendFeedback() {
				var feedbackObj = createFeedBackPayload();
				var url = '//e3.adpushup.com/AdPushupFeedbackWebService/feedback?data=';
				var data = window.btoa(JSON.stringify(feedbackObj));
				var toFeedback = url + data;
				fireImagePixel(toFeedback);
			}

			function fireImagePixel(src) {
				var imgEl = document.createElement('img');
				imgEl.src = src;
			}

			function createFeedBackPayload() {
				var adpConfig = window.adpushup && window.adpushup.config ? window.adpushup.config : {};
	
				var feedbackObj = {
					createdTS: +new Date(),
					packetId: adpConfig.packetId,
					siteId: adpConfig.siteId || siteId,
					siteDomain: adpConfig.siteDomain || domain,
					url: adpConfig.pageUrl || window.location.href,
					mode: 1,
					errorCode: 1,
					referrer: adpConfig.referrer || window.document.referrer,
					platform: 'MOBILE',
					isGeniee: false,
					sections: [
						{
							sectionId: adId,
							sectionName: adName,
							status: 1,
							network: 'adpTags',
							networkAdUnitId: dfpAdunit,
							services: [2],
							adUnitType: 5
						}
					]
				};
	
				return feedbackObj;
			}
			 ************ */

const REWARDED_AD_CODE = `<script>
   !(function(w, d) {
	var adpTags = (w.adpTags = w.adpTags || { que: [] });
	adpTags.que.push(function(){
		if (!!navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)) {
			var siteId = __SITE_ID__;
			var domain = '__SITE_DOMAIN__';
			var adId = '__AD_ID__';
			var adName = '__AD_NAME__';
			var dfpAdunit = '__AD_UNIT__';
	        var watchButton = typeof window.WATCH_BUTTON_TEXT === 'undefined' ? 'Watch' : window.WATCH_BUTTON_TEXT;
			var noThanksButton = typeof window.NO_THANKS_BUTTON === 'undefined' ? 'Close' : window.NO_THANKS_BUTTON;
			var modalText= typeof window.MODAL_TEXT === 'undefined' ? '__MODAL_TEXT__' : window.MODAL_TEXT;
			var cssAnimation = document.createElement('style');
			cssAnimation.type = 'text/css';
			var rules = document.createTextNode(
				'@keyframes modalopen {' +
					'from {' +
					'opacity: 0;' +
					' }' +
					'to {' +
					'opacity: 1;' +
					'}' +
					'}'
			);
			cssAnimation.appendChild(rules);
			document.getElementsByTagName('head')[0].appendChild(cssAnimation);
	
			function createFeedBackPayload() {
				var feedbackObj = {
					mode: 1,
					errorCode: 1,
					ads: [
						{
							id: adId,
							originalId:adId,  // in case of isManual:true we're checking originalId
							isManual: true,
							sectionName: adName,
							status: 1,
							network: 'adpTags',
						    networkData:{
								dfpAdunit:dfpAdunit
							},
							services: [2],
							adUnitType: 5
						}
					]
				};
	
				return feedbackObj;
			}
	
			function sendFeedback() {
				var feedbackObj = createFeedBackPayload();
			    w.adpushup.utils.sendFeedback(feedbackObj);	
			}
	
			var $ = w.adpushup.$;
			var makeRewardVisible = false;
			
			var rewardedData = JSON.parse(localStorage.getItem('aprewarded_key'));
			function triggerRewardedAd() {
				var urlParams = new URLSearchParams(window.location.search);
					sendFeedback();
					function addModalStyle(styles) {
						/* Create style document */
						var css = document.createElement('style');
						css.type = 'text/css';
	
						css.appendChild(document.createTextNode(styles));
	
						/* Append style to the tag name */
						document.getElementsByTagName('head')[0].appendChild(css);
					}
	
					const forceRewarded = false;
	
					var styles =
						'.rewarded-modal {display: none;position: fixed;z-index: 1000;left: 0;top: 0;height: 100%;' +
						'width: 100%; overflow: auto; background-color: rgba(0, 0, 0);}' +
						'.rewarded-modal-content {margin: 50% auto;width: 60%;' +
						'box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2),0 7px 20px 0 rgba(0, 0, 0, 0.17);' +
						'animation-name: modalopen;animation-duration: 1s;}' +
						'.rewarded-modal-body { padding: 10px 20px;background: #fff;height: 150px; display: table-cell; vertical-align: middle;width: 60%;}' +
						'.rewarded-modal-body>p{font-size: 14px;}'+
						'.close {color: #ccc;float: right;font-size: 30px;line-height: 12px;color: #fff;}' +
						'.close:hover,.close:focus {color: #000;text-decoration: none;cursor: pointer;}' +
						'@keyframes modalopen {from {opacity: 0;}to {opacity: 1;}}' +
						'.watch {background-color: #428bca;border: none;color: white;border-radius: 5px;' +
						'font-size: 15px;float: right;position: relative;margin-left: 5px;}' +
						'.closeModal {font-size: 15px;border: none;float: right;position: relative;border-radius: 5px;' +
						'color: #000;} ;';
	
					googletag = w.googletag || { cmd: [] };
	
					function setupRewarded() {
						const rewardedSlot = googletag
							.defineOutOfPageSlot(
								'/__NETWORK_CODE__/__AD_UNIT__',
								googletag.enums.OutOfPageFormat.REWARDED
							)
							.addService(googletag.pubads())
							.setTargeting('adpushup_ran', 1);
						rewardedSlot.setForceSafeFrame(true);
						return rewardedSlot;
					}
	
					var isSlotLogged = false;
					var startTime;
					var refreshCount = -1;
	
					function processRewarded() {
						var slot = setupRewarded();
						if (!googletag.pubads().isInitialLoadDisabled()) {
							googletag.display(slot);
						} else {
							googletag.pubads().refresh([slot]);
						}
						isSlotLogged = false;
						startTime = performance.now();
						refreshCount++;
						return slot;
					}
	
					function log(eventType, id, dfpResponseTime) {
						var data = {
							timestamp: new Date().getTime(),
							type: 0,
							id: id,
							eventType: eventType,
							pageUrl: w.location.href,
							lang: d.documentElement.lang,
							ua: navigator.userAgent,
							releaseVersion: 2,
							forced: forceRewarded,
							refreshCount: refreshCount,
							userStats: JSON.parse(localStorage.getItem('aprewarded_key'))
						};
						if (dfpResponseTime) data.dfpResponseTime = dfpResponseTime;
	
						const logUrl = 'https://vastdump-staging.adpushup.com/rewardedAdDump';
	
						if (navigator.sendBeacon) {
							navigator.sendBeacon(logUrl, JSON.stringify(data));
						} else {
							var img = new Image();
							var encData = btoa(JSON.stringify(data));
							img.src = logUrl + '?data=' + encData;
						}
					}
	
					return googletag.cmd.push(function() {
						function getRandomData() {
							if (w && w.crypto && w.crypto.getRandomValues) {
								return crypto.getRandomValues(new Uint8Array(1))[0] % 16;
							} else {
								return Math.random() * 16;
							}
						}
						function generateUUID(placeholder) {
							return placeholder
								? (placeholder ^ (getRandomData() >> (placeholder / 4))).toString(16)
								: ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUUID);
						}
	
						function generateModalCode(forced) {
							let modalHtml =
								'<div id="rewarded-modal" class="rewarded-modal">' +
								'<div class="rewarded-modal-content">' +
								'<div class="rewarded-modal-body">' +
								'<p>'+modalText+'</p>' +
								'<button id ="watchAdBtn" class=" watch primary">' +
								watchButton +
								'</button>';
	
							if (!forced) {
								const closeHtml =
									'<button  id ="noThanksBtn" class="closeModal secondary"><span class="lg">' +
									noThanksButton+
									'</button>';
								modalHtml += closeHtml;
							}
	
							modalHtml = modalHtml + '</div> </div> <div>';
							return modalHtml;
						}
	
						if (!localStorage.getItem('aprewarded_key')) {
							localStorage.setItem(
								'aprewarded_key',
								JSON.stringify({
									ready: 0,
									granted: 0,
									played: 0,
									userId: generateUUID(),
									rejected: false,
									rejectedFinal: false
								})
							);
						} else {
							var initData = JSON.parse(localStorage.getItem('aprewarded_key'));
							if (typeof initData.rejectedFinal === 'undefined') {
								initData.rejected = false;
								localStorage.setItem('aprewarded_key', JSON.stringify(initData));
							}
						}
	
						var uuid = generateUUID();
						log(5, uuid);
	
						var slot = processRewarded();
	
						googletag.pubads().addEventListener('rewardedSlotReady', function(rewardedEvent) {
							addModalStyle(styles);
							// replaceOriginalButtonWithCloned();
	
							$('body').append(generateModalCode(forceRewarded));
	
							let timer = setInterval(function() {
								if (makeRewardVisible) {
									rewardedEvent.makeRewardedVisible();
									clearInterval(timer);
								}
							}, 100);
	
							var rewardedData = JSON.parse(localStorage.getItem('aprewarded_key'));
							rewardedData.ready += 1;
							localStorage.setItem('aprewarded_key', JSON.stringify(rewardedData));
	
							var modalShown = false;
	
							$('#rewarded-modal').show();
	
							if (!modalShown) {
								log(6, uuid);
	
								modalShown = true;
	
								$('#watchAdBtn').click(onWatchAdClicked);
	
								function onWatchAdClicked() {
									var rewardedData = JSON.parse(localStorage.getItem('aprewarded_key'));
									rewardedData.played += 1;
									localStorage.setItem('aprewarded_key', JSON.stringify(rewardedData));
									log(1, uuid);
									makeRewardVisible = true;
								}
	
								function onWatchAdClosed() {
									$('#rewarded-modal').hide();
								}
	
								$('#noThanksBtn, #rewarded-modal-close').click(onWatchAdClosed);
							}
	
							log(0, uuid);
						});
	
						googletag.pubads().addEventListener('rewardedSlotGranted', function(e) {
							var rewardedData = JSON.parse(localStorage.getItem('aprewarded_key'));
							rewardedData.granted += 1;
							localStorage.setItem('aprewarded_key', JSON.stringify(rewardedData));
							$('#rewarded-modal').hide();
							log(2, uuid);
							var slot = googletag
								.pubads()
								.getSlots()
								.find(slot => slot.getAdUnitPath() === '/__NETWORK_CODE__/__AD_UNIT__');
							googletag.destroySlots([slot]);
							__POST_REWARDED_FUNCTION__
						});
	
						googletag.pubads().addEventListener('rewardedSlotCanceled', function(e) {
							makeRewardVisible = false;
							log(3, uuid);
							$('#rewarded-modal').remove();
							if (forceRewarded) {
								var slot = googletag
									.pubads()
									.getSlots()
									.find(slot => slot.getAdUnitPath() === '/__NETWORK_CODE__/__AD_UNIT__');
								googletag.destroySlots([slot]);
								processRewarded();
							}
						});
	
						googletag.pubads().addEventListener('slotRenderEnded', function(event) {
							var slotEnded = event.slot;
							var endTime = performance.now();
							if (slot === slotEnded && !isSlotLogged) {
								isSlotLogged = true;
								//send log here
								var dfpResponseTime = endTime - startTime;
								var uuid = generateUUID();
								log(7, uuid, dfpResponseTime);
							}
						});
					});
				
			}
			__TRIGGER_REWARDED_AD__;
		}
	});
})(window, document);
</script>
`;

const TIGGER_AUTOMATICALLY_CODE = `triggerRewardedAd()`;

const ADS_TXT_DATA = `#AdX
google.com,pub-8933329999391104,RESELLER,f08c47fec0942fa0
#DMX and OpenX
openx.com, 539848768, RESELLER 
districtm.io, 101143, DIRECT
appnexus.com, 1908, RESELLER
appnexus.com, 7944, RESELLER
google.com, pub-9685734445476814, RESELLER, f08c47fec0942fa0
#C1X
c1exchange.com, 14924, RESELLER
#Pulsepoint
contextweb.com,560684,RESELLER,89ff185a4c4e857c
#BrainJuiceMedia
appnexus.com, 3911, RESELLER, f5ab79cb980f11d1
#OFT
appnexus.com, 3153, RESELLER, f5ab79cb980f11d1
districtm.io, 100750, DIRECT
adtech.com, 11095, Reseller
coxmt.com, 2000067907202, Reseller
Openx.com, 537143344, Reseller
indexexchange.com, 175407, Reseller
#Media.net
media.net, 8CUPEPKI9, DIRECT	
sonobi.com, 83729e979b, RESELLER	
coxmt.com, 2000068030802, RESELLER	
districtm.io, 100600, RESELLER	
appnexus.com, 1908, RESELLER, f5ab79cb980f11d1
media.net, 8CUZU1Z30, DIRECT
google.com, pub-7439041255533808, RESELLER, f08c47fec0942fa0
openx.com, 537100188, RESELLER, 6a698e2ec38604c6
altitude-arena.com, EELLLBP86H2PDAQQLSK385CM5G, RESELLER
altitude-arena.com, EELLLBP86H2PDAQQLSK385CM5G, DIRECT
indexexchange.com, 182961, RESELLER
pubmatic.com, 93915, RESELLER, 5d62403b186f2ace
spotxchange.com, 152198, RESELLER, 7842df1d2fe2db34
openx.com, 537141219, RESELLER, 6a698e2ec38604c6
rubiconproject.com, 14410, RESELLER, 0bfd66d529a55807
spotxchange.com, 211156, RESELLER, 7842df1d2fe2db34
spotx.tv, 211156, RESELLER, 7842df1d2fe2db34
#DMXDirect
districtm.io, 101642,DIRECT 
appnexus.com, 1908, RESELLER, f5ab79cb980f11d1 
google.com, pub-9685734445476814, RESELLER, f08c47fec0942fa0 
# 33Across
33across.com,0010b00002AQUQFAA5, DIRECT 
google.com, pub-9557089510405422, RESELLER, f08c47fec0942fa0 
appnexus.com, 1001, RESELLER 
appnexus.com, 3135, RESELLER 
openx.com, 537120563, RESELLER, 6a698e2ec38604c6 
rubiconproject.com, 16414, RESELLER, 0bfd66d529a55807 
pubmatic.com, 156423, RESELLER, 5d62403b186f2ace 
amazon.com, 3411, RESELLER 
criteo.com, 3450, RESELLER
indexexchange.com, 185506, RESELLER
adtech.com, 9993, RESELLER 
aolcloud.net, 9993, RESELLER
openx.com, 539266264, RESELLER, 6a698e2ec38604c6  
appnexus.com, 1356, RESELLER, f5ab79cb980f11d1  
emxdgt.com, 326, RESELLER, 1e1d41537f7cad7f  
google.com, pub-5995202563537249, RESELLER, f08c47fec0942fa0`;
const INIT_CODE = `<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/__SITE_ID__/adpushup.js'; s.crossOrigin='anonymous'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>`;

// APT abbreviation stands for ApTag
const APT_NAV_ITEMS_INDEXES = {
	CREATE_ADS: 'create-ads',
	MANAGE_ADS: 'manage-ads'
};

const APT_NAV_ITEMS_VALUES = {
	CREATE_ADS: 'Create Ads',
	MANAGE_ADS: 'Manage Ads'
};

const APT_NAV_ITEMS = {
	[APT_NAV_ITEMS_INDEXES.CREATE_ADS]: {
		NAME: [APT_NAV_ITEMS_VALUES.CREATE_ADS],
		INDEX: 1
	},
	[APT_NAV_ITEMS_INDEXES.MANAGE_ADS]: {
		NAME: [APT_NAV_ITEMS_VALUES.MANAGE_ADS],
		INDEX: 2
	}
};

const NETWORK_MAPPINGS = {
	ADPTAGS: 'adpTags',
	ADSENSE: 'adsense',
	CUSTOM: 'custom',
	GENIEE: 'geniee',
	MEDIANET: 'medianet'
};

const NETWORKS = [
	NETWORK_MAPPINGS.ADSENSE,
	NETWORK_MAPPINGS.ADPTAGS,
	NETWORK_MAPPINGS.CUSTOM,
	NETWORK_MAPPINGS.GENIEE,
	NETWORK_MAPPINGS.MEDIANET
];
const PRICE_FLOOR_KEYS = ['FP_S_A', 'FP_B_A', 'FP_S', 'FP_A', 'FP_B'];
const DEFAULT_PRICE_FLOOR_KEY = 'FP_S_A';
const PARTNERS = {
	geniee: {
		name: 'geniee',
		networks: {
			disabled: ['adpTags', 'medianet']
		}
	},
	list: ['geniee']
};
const IAB_SIZES = {
	ALL: [
		[120, 600],
		[160, 600],
		[200, 200],
		[240, 400],
		[250, 250],
		[300, 50],
		[300, 100],
		[300, 250],
		[300, 600],
		[320, 50],
		[320, 100],
		[320, 480],
		[336, 280],
		[468, 60],
		[480, 320],
		[720, 300],
		[728, 90],
		[728, 250],
		[728, 280],
		[900, 90],
		[970, 90],
		[970, 250],
		['responsive', 'responsive']
	],
	MULTIPLE_AD_SIZES_WIDTHS_MAPPING: {
		'300': [[300, 50], [300, 100], [300, 250], [300, 600]],
		'320': [[320, 50], [320, 100], [320, 480]],
		'728': [[728, 90], [728, 250], [728, 280]],
		'970': [[970, 90], [970, 250]]
	},
	// The backward compatible size array for every ad size contains itself as well
	BACKWARD_COMPATIBLE_MAPPING: {
		// MOBILE sizes
		'120,600': [[120, 600]],
		'160,600': [[120, 600], [160, 600]],
		'200,200': [[200, 200]],
		'240,400': [[200, 200], [240, 400]],
		'250,250': [[200, 200], [250, 250]],
		'300,50': [[300, 50]],
		'300,100': [[300, 50], [300, 100]],
		'300,250': [[300, 250]],
		'300,600': [[160, 600], [300, 250], [300, 600]],
		'320,50': [[320, 50]],
		'320,100': [[320, 50], [320, 100]],
		'320,480': [[300, 250], [320, 50], [320, 100], [320, 480]],
		'336,280': [[300, 250], [336, 280]],
		// TABLET sizes
		'468,60': [[468, 60]],
		'480,320': [[250, 250], [300, 250], [320, 50], [320, 100], [336, 280], [468, 60], [480, 320]],
		// DESKTOP sizes
		'720,300': [[300, 250], [336, 280], [720, 300]],
		'728,90': [[728, 90]],
		'728,250': [[300, 250], [728, 90], [728, 250]],
		'728,280': [[300, 250], [336, 280], [728, 90], [728, 250], [728, 280]],
		'900,90': [[728, 90], [900, 90]],
		'970,90': [[728, 90], [900, 90], [970, 90]],
		'970,250': [[300, 250], [728, 90], [728, 250], [900, 90], [970, 90], [970, 250]],
		// RESPONSIVE size
		'responsive,responsive': [
			[120, 600],
			[160, 600],
			[200, 200],
			[240, 400],
			[250, 250],
			[300, 50],
			[300, 100],
			[300, 250],
			[300, 600],
			[320, 50],
			[320, 100],
			[320, 480],
			[336, 280],
			[468, 60],
			[480, 320],
			[720, 300],
			[728, 90],
			[728, 250],
			[728, 280],
			[900, 90],
			[970, 90],
			[970, 250]
		]
	}
};
const DEFAULT_ADS_RESPONSE = { fetched: false, content: [] };
const DEFAULT_GLOBAL_RESPONSE = {
	currentAd: null
};

export {
	PLATFORMS,
	TYPES,
	SIZES,
	CUSTOM_FIELDS,
	CUSTOM_FIELD_DEFAULT_VALUE,
	DISPLAY_AD_MESSAGE,
	ADCODE,
	ADS_TXT_DATA,
	INIT_CODE,
	AMP_MESSAGE,
	APT_NAV_ITEMS,
	APT_NAV_ITEMS_INDEXES,
	APT_NAV_ITEMS_VALUES,
	NETWORKS,
	PRICE_FLOOR_KEYS,
	DEFAULT_PRICE_FLOOR_KEY,
	PARTNERS,
	IAB_SIZES,
	DEFAULT_ADS_RESPONSE,
	DEFAULT_GLOBAL_RESPONSE,
	REWARDED_AD_CODE,
	TIGGER_AUTOMATICALLY_CODE,
	NETWORK_MAPPINGS
};
