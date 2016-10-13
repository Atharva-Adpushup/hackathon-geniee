var utils = require('./libs/custom/utils.js'),
	Tracker = require('./libs/custom/tracker.js'),
	nodewatcher = require('./libs/custom/nodeWatcher.js'),
	browserConfig = require('./libs/custom/browserConfig'),
	incontentAnalyser = require('./libs/custom/aa'),
	heartBeat = require('./libs/custom/heartBeat'),
	w = window, d = document, pageGroupTimer,
	adp = (w.adpushup = w.adpushup || {}),
	control = require('./libs/custom/control')(),
	tempConfig, i, key, done, creationProcessStarted = false, heartBeatTracker,
	config = adp.config = require('./config/config.js'),
	$ = adp.$ = require('./libs/third-party/jquery');

(function init() {
	// Extend the settings with generated settings
	// eslint-disable-next-line no-undef
	adp.$.extend(adp.config, ___abpConfig___);

	// store configure object in temp variable.
	tempConfig = adp.configure;

	// hook configure with our own implementation
	adp.configure = {
		push: function(obj) {
			var k;
			// eslint-disable-next-line guard-for-in
			for (k in obj) {
				switch (k) {
					case 'siteId':
						obj.siteId = obj.siteId ? parseInt(obj.siteId, 10) : null;
						break;
					case 'pageGroup':
						// if  PageGroup pushed again then ignore it
						obj.pageGroup = config.pageGroup ? config.pageGroup.toUpperCase() : obj.pageGroup.toUpperCase();
						if (!creationProcessStarted) { // if pagegroup is pushed later the start creation
							this.startCreation();
						}
						break;
					case 'siteDomain':
						obj.siteDomain = obj.siteDomain ? encodeURIComponent(obj.siteDomain.replace(/^www\./i, '')) : null;
						break;
					case 'pageUrl':
						obj.pageUrl = obj.pageUrl ? encodeURIComponent(obj.pageUrl) : null;
						break;
					default:
						break;
				}
			}
			$.extend(adp.config, obj);
		}
	};

	// PageGroup via URL pattern implementation. This must run before we merge tempConfig with config as priority of pageGroupPattern is high then config.
	if (config.pageGroupPattern) {
		for (i = 0; i < config.pageGroupPattern.length; i++) {
			for (key in config.pageGroupPattern[i]) {
				if (w.location.href.match(new RegExp(config.pageGroupPattern[i][key], 'i'))) {
					done = true;
					// forceFully set pagegroup in case url pattern matches to current url
					config.pageGroup = key + '_APEX'.toUpperCase();
				}
			}
			if (done) break;
		}
	}

	// Pushing tempConfig into our configure
	if (tempConfig instanceof Array) {
		for (i = 0; i < tempConfig.length; i++) {
			if (typeof tempConfig[i] === 'object') {
				// eslint-disable-next-line guard-for-in
				adp.configure.push(tempConfig[i]);
			}
		}
	}

	// Push platform in the config
	adp.configure.push({ 'platform': browserConfig.platform });


	// Blocklist Implementation
	if (config.blocklist && config.blocklist instanceof Array) {
		for (var x = 0, j = config.blocklist, k = j[x]; x < j.length; k = j[++x]) {
			if (window.location.href.match(new RegExp(k, 'i'))) {
				config.disable = true;
				break;
			}
		}
	}

	pageGroupTimer = setTimeout(function() {
		if (!config.pageGroup) {
			adp.triggerControl(3);
		}
	}, 5000);
})();


adp.$.extend(adp, {
	err: [],
	control: control,
	tracker: new Tracker(),
	segregateAds: function(ads) {
		var a, ad, structuredAds = [], inContentAds = [];
		for (a = 0; a < ads.length; a++) {
			ad = ads[a];
			ad.isIncontent ? inContentAds.push(ad) : structuredAds.push(ad);
		}
		return { structuredAds: structuredAds, inContentAds: inContentAds };
	},
	triggerControl: function(mode) {
		// if config has disable or this function triggered more than once or no pageGroup found then do nothing;
		if (config.disable  || creationProcessStarted) {
			return false;
		}
		creationProcessStarted = true;
		this.control.trigger();
		// TODO send feedback to server regarding control
		utils.sendFeedback({eventType: 3, mode: mode, referrer: config.referrer});
	},
	startCreation: function() {
		// if config has disable or this function triggered more than once or no pageGroup found then do nothing;
		if (config.disable  || creationProcessStarted || !config.pageGroup) {
			return false;
		}
		clearTimeout(pageGroupTimer);

		// Order of variable declaration should not be changed
		var structuredAds, inContentAds, me = this, displayCounter, finished = false,
			ads = this.selectVariationAndGetAds(), // set the active variation and get ads of that variation, if no ads then send feedback immidiately
			feedbackData = {
				ads: [],
				xpathMiss: [],
				eventType: 1,
				mode: 1,
				referrer: config.referrer,
				tracking: browserConfig.trackerSupported,
				chosenVariation: config.chosenVariation // set the chosenVariation variation in feedback data;
			},
			next = function(adObj, data) {
				if (displayCounter) {
					displayCounter--;
					if (data.success) {
						me.placeAd(data.container, adObj);
					}
				}
				if (!displayCounter && !finished) {
					finished = true;
					if (config.customJs && config.customJs.afterAp) {
						me.runScript(utils.base64Decode(config.customJs.afterAp));
					}
					utils.sendFeedback(feedbackData);
				}
			},
			handleContentSelectorFailure = function() {
				feedbackData.contentSelectorMissing = true;
				$.each(inContentAds, function(index, ad) {
					feedbackData.xpathMiss.push(ad.sectionMd5);
					next.call(me, ad, { success: false });
				});
			};

		// if no ads found the trigger control and send feedback
		if (!ads || !ads.length) {
			this.triggerControl(3);
			return false;
		}

		// Mark flag creationProcessStarted as true, It should be marked true only here not top as above trigger control will not work if this flag is set true
		creationProcessStarted = true;

		if (config.customJs && config.customJs.beforeAp) {
			this.runScript(utils.base64Decode(config.customJs.beforeAp));
		}

		// Heart beat implementation
		heartBeatTracker = heartBeat(config.feedbackUrl, config.heartBeatMinInterval, config.heartBeatDelay);
		heartBeatTracker.start();

		displayCounter = ads.length;
		ads = this.segregateAds(ads); // segregate incontent and strutural ads so that they can be placed accordingly.

		structuredAds = ads.structuredAds;
		inContentAds = ads.inContentAds;

		// Process strutural sections
		$.each(structuredAds, function(index, ad) {
			me.getAdContainer(ad).done(function(data) {
				// if all well then ad sectionMd5 of ad in feedback to tell system that impression was given
				feedbackData.ads.push(ad.sectionMd5);
				next.call(me, ad, data);
			}).fail(function(data) {
				feedbackData.xpathMiss.push(ad.sectionMd5);
				next.call(me, ad, data);
			});
		});

		// Process incontent sections
		// If incontent ads thr but no xpath given for content area
		if (inContentAds.length && !config.contentSelector) {
			handleContentSelectorFailure();
		} else if (inContentAds.length) {
			nodewatcher.watch(config.contentSelector, this.config.xpathWaitTimeout).done(function($incontentElm) {
				incontentAnalyser($incontentElm, inContentAds, function(sectionsWithTargetElm) {
					$(inContentAds).each(function(index, ad) {
						var sectionObj = sectionsWithTargetElm[ad.section];

						if (sectionObj && sectionObj.elem) {
							if (!!(sectionObj.isSecondaryCss)) {
								ad.css = $.extend(true, {}, ad.secondaryCss);
							}

							feedbackData.ads.push(ad.sectionMd5);
							next.call(me, ad, { success: true, container: me.getContainer(ad, sectionObj.elem)});
						} else {
							feedbackData.xpathMiss.push(ad.sectionMd5);
							next.call(me, ad, { success: false, container: null });
						}
					});
				});
			}).fail(function() {
				handleContentSelectorFailure();
			});
		}
	},

	getAdContainer: function(ad) {
		// eslint-disable-next-line new-cap
		var defer = $.Deferred(),
			me = this;

		nodewatcher.watch(ad.xpath, this.config.xpathWaitTimeout).done(function() {
			var container = me.getContainer(ad);
			container ? defer.resolve({ container: container, success: true }) : defer.reject({ xpathMiss: true, success: false });
		}).fail(function() {
			defer.reject({ xpathMiss: true, success: false });
		});
		return defer.promise();
	},

	runScript: function(str) {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.text = str;
		script.html = str;
		(d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(script);
	},

	getContainer: function(ad, el) {
		if (!el) {
			el = $(ad.xpath);
		}
		var container = $('<div/>').css($.extend({
			'display': 'block',
			'clear': ad.isIncontent ? null : 'both',
			'width': ad.width + 'px',
			'height': ad.height + 'px'
		}, ad.css)).attr({
			'data-section': ad.sectionMd5,
			'class': '_ap_apex_ad',
			'data-xpath': ad.xpath ? ad.xpath : '',
			'data-section-id': ad.section ? ad.section : ''
		});

		switch (ad.operation) {
			case 'Append':
				el.append(container);
				break;
			case 'Prepend':
				el.prepend(container);
				break;
			case 'Insert Before':
				el.before(container);
				break;
			default:
				el.after(container);
		}
		return container;
	},

	selectVariationAndGetAds: function() {
		// if no experimnet setup for given platform and pagegroup
		if (!config.variations[config.platform] || !config.variations[config.platform][config.pageGroup]) {
			return false;
		}

		var allVariations = config.variations[config.platform][config.pageGroup], variationsArray = [],
			variation, rand = Math.floor(Math.random() * (100)) + 1, tempNumber = 0, forcedvariation = utils.queryParams[config.forceVariation];

		// if variation is forced
		if (forcedvariation && allVariations[forcedvariation]) {
			config.chosenVariation = forcedvariation;
			config.contentSelector = allVariations[forcedvariation].contentSelector;
			config.customJs = allVariations[forcedvariation].customJs;
			return allVariations[config.chosenVariation].ads && allVariations[config.chosenVariation].ads.length ? allVariations[config.chosenVariation].ads : false;
		} else if (forcedvariation && !allVariations[forcedvariation]) {
			alert('Varition you are trying to force doesn\'t exist, system will now choose variation automatically');
		}

		// convert object to Array
		for (variation in allVariations) {
			if (allVariations.hasOwnProperty(variation)) {
				allVariations[variation].name = variation;
				variationsArray.push(allVariations[variation]);
			}
		}

		variationsArray.sort(function(a, b) {
			return a.traffic - b.traffic;
		});

		$.each(variationsArray, function(j, variationObj) {
			tempNumber =  variationObj.traffic + tempNumber;
			if (rand <= tempNumber) {
				config.chosenVariation = variationObj.name;
				config.contentSelector = variationObj.contentSelector;
				config.customJs = variationObj.customJs;

				return false;
			}
		});

		return config.chosenVariation && allVariations[config.chosenVariation] && allVariations[config.chosenVariation].ads && allVariations[config.chosenVariation].ads.length ? allVariations[config.chosenVariation].ads : false;
	},

	placeAd: function(container, ad) {
		try {
			$.ajaxSettings.cache = true;
			container.append(utils.base64Decode(ad.adCode));
			$.ajaxSettings.cache = false;
			this.tracker.add(container, function(sectionMd5) {
				utils.sendBeacon(config.feedbackUrl, {eventType: 2, click: true, sectionMd5: sectionMd5 });
			}.bind(this, ad.sectionMd5));
		} catch (e) {
			this.err.push({ msg: 'Error in placing ad.', ad: ad, error: e });
		}
		return true;
	}
});

module.exports = adp;
