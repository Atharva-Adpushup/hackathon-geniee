
var _ = require('libs/third-party/underscore'),
	CommonConsts = require('editor/commonConsts'),
	stores = CommonConsts.enums.stores,
	Fluxxor = require('libs/third-party/fluxxor'),
	Utils = require('libs/custom/utils'),
	CryptoJS = require('libs/third-party/crypto');

module.exports = (function() {
	var Section, actionManager, SectionStore;

	Section = function(name, channelId, xpath, operation, id, sectionMd5, sectionData, allXpaths, adCode) {
		this.id = id || Utils.getRandomNumber();
		this.xpath = xpath;
		this.isIncontent = false;
		this.inContentSettings = {};
		this.operation = operation;
		this.channelId = channelId;
		this.sectionData = sectionData;
		this.name = name || 'Section_' + Utils.getRandomNumber();
		this.sectionMd5 = sectionMd5 || CryptoJS.MD5(this.xpath + this.operation + this.id).toString();
		this.allXpaths = allXpaths || [];
		this.xpathMissing = false;
		this.adCode = adCode || null;
	};

	Section.prototype.audianceExists = function(audienceId) {
		return this.segments.indexOf(audienceId) === -1;
	};

	Section.prototype.setSectionName = function(name) {
		this.name = name;
	};

	Section.prototype.setXpath = function(xpath) {
		this.xpath = xpath;
	};

	Section.prototype.populate = function(payload) {
		var props;
		for (props in this) {
			if (this.hasOwnProperty(props) && typeof payload[props] !== 'undefined') {
				this[props] = payload[props];
			}
		}
		return this;
	};

	Section.prototype.getActionByKey = function(audienceId, key) {
		var actions = this.segments[audienceId];
		if (!actions) return null;
		return actions[key];
	};

	Section.prototype.toJSON = function(flux) {
		var actions = flux.store(stores.ACTION_STORE).sectionActionsToJSON(this.id),
			apex = flux.store(stores.SITE_STORE).apex;

		if (apex) {
			return {
				id: this.id,
				xpath: this.xpath,
				operation: this.operation,
				channelId: this.channelId,
				name: this.name,
				isIncontent: this.isIncontent,
				inContentSettings: this.inContentSettings,
				adCode: this.adCode,
				sectionMd5: this.sectionMd5,
				ads: flux.store(stores.ACTION_STORE).getSectionAds(this.id, this.channelId),
				actions: actions
			};
		}

		if (_.isEmpty(actions)) {
			return false;
		}

		return {
			id: this.id,
			xpath: this.xpath,
			operation: this.operation,
			channelId: this.channelId,
			name: this.name,
			adCode: this.adCode,
			sectionMd5: this.sectionMd5,
			ads: flux.store(stores.ACTION_STORE).getSectionAds(this.id, this.channelId),
			actions: actions
		};
	};

	Section.load = function(json) {
		var section = new Section();
		json.sectionData = {
			impressions: json.impressions,
			clicks: json.clicks
		};
		section.populate(json);
		return section;
		/* return new Section(json.name, json.channelId, json.xpath, json.operation, json.id, json.sectionMd5, {
			impressions: json.impressions,
			clicks: json.clicks
		}, json.allXpaths, json.adCode);*/
	};

	actionManager = CommonConsts.enums.actionManager;

	SectionStore = Fluxxor.createStore({
		initialize: function(options) {
			this.sections = [];
			this.messenger = options.messenger;
			var SM = CommonConsts.enums.actions.sectionManager;

			this.bindActions(
				CommonConsts.enums.actions.siteManager.LOAD_SITE, this.loadSections,

				CommonConsts.enums.actions.channelManager.STATS_LOADED, this.onStatsSuccess,
				CommonConsts.enums.actions.channelManager.LOAD_CHANNEL, this.loadChannelSections,

				SM.HIDE_AD, this.hideAd,
				SM.CREATE_SECTION, this.createSection,
				SM.CREATE_APEX_INCONTENT_SECTION, this.createApexIncontentSection,
				SM.UPDATE_SECTION, this.updateSection,
				SM.DELETE_SECTION, this.deleteSection,
				SM.DELETE_SECTION_BYID, this.deleteSectionById,
				SM.GET_ALL_AUDIENCES_FROM_SECTION, this.getAllAudiencesFromSection,
				SM.SCROLL_SECTION_TO_SCREEN, this.scrollSectionToScreen,
				CommonConsts.enums.actions.channelManager.UNLOAD_CHANNEL, this.unloadChannelSection,
				CommonConsts.enums.actions.actionManager.REMOVE_SIZE_FROM_SECTION, this.monitorAction
			);
		},

		hideAd: function(payload) {
			this.messenger.sendMessage(ADP.enums.messenger.HIDE_AD, payload);
		},

		getSectionById: function(id) {
			return _.find(this.sections, function(section) {
				return section.id === id;
			});
		},
		getSectionByName: function(name) {
			name = name.toLowerCase();
			return _.find(this.sections, function(section) {
				return section.name.toLowerCase() === name;
			});
		},
		getChannelSectionByName: function(channelid, name) {
			name = name.toLowerCase();
			return _.find(this.getChannelSection(channelid), function(section) {
				return section.name.toLowerCase() === name;
			});
		},
		removeSection(section) {
			var index = this.sections.indexOf(section);
			if (index > -1) {
				this.sections.splice(index, 1);
				return true;
			}
		},
		getSectionByXpathAndOperation(selector, operation) {
			return _(this.sections).findWhere({ xpath: selector, operation: operation });
		},
		getChannelSection: function(channelID) {
			return _.filter(this.sections, function(section) {
				return section.channelId === channelID;
			});
		},

		channelSectionsToJSON: function(channelID) {
			var sections = this.getChannelSection(channelID), json = [], t;
			if (!sections) {
				return [];
			}
			sections.forEach(function(section) {
				t = section.toJSON(this.flux);
				if (t) { // incase section has no actions
					json.push(t);
				}
			}.bind(this));
			return json;
		},

		getSectionByXpath: function(xpath) {
			return _.find(this.sections, function(section) {
				return section.xpath === xpath;
			});
		},
		createSection: function(payload) {
			var activeChannel = this.flux.store(stores.CHANNEL_STORE).activeChannel,
				section = null, sections;

			sections = this.getChannelSection(activeChannel.id);
			section = _(sections || []).findWhere({ xpath: payload.selector, operation: payload.operation });
			// Get SiteStore check if apex is set or not.
			this.waitFor([stores.SITE_STORE], function(siteStore) {
				var siteState = siteStore.getState();
				if (!section) {
					section = new Section(payload.name, activeChannel.id, payload.selector, payload.operation);
					this.sections.push(section);
				}
				// if apex set then set adcode to the section,
				// this adcode will be used ad adcode for this section rather than using the ads formed using action
				if (siteState.apex && payload.adCode) {
					section.adCode = payload.adCode;
				}
				setTimeout(function() {
					this.flux.actions.createAction({
						name: actionManager.publicCommands.ADD_SIZE_TO_SECTION,
						owner: actionManager.levels.SECTION,
						ownerId: section.id,
						audienceId: payload.audienceId,
						adSize: payload.adSize
					});
				}.bind(this), 0);

				this.emit('change');
			});
		},
		createApexIncontentSection: function(payload) {
			var activeChannel = this.flux.store(stores.CHANNEL_STORE).activeChannel, section, sections;
			sections = this.getChannelSection(activeChannel.id);
			section = _(sections || []).find(function(sec) {
				return sec.isIncontent && sec.inContentSettings.section === payload.inContentSettings.section;
			});
			if (!section) {
				section = new Section(payload.name, activeChannel.id);
				section.populate(payload);
				section.operation = 'Insert After';
				this.sections.push(section);
			} else {
				alert('Section Already Exists');
			}
			this.emit('change');
		},
		updateSection: function(payload) {
			var section = this.getSectionById(payload.id);
			if (section) {
				section.populate(payload);
				this.emit('change');
			}
		},
		deleteSection: function(payload) {
			if (this.getSectionByXpath(payload.selector)) {
				this.messenger.sendMessage(ADP.enums.messenger.REMOVE_AD, payload);
			}
			this.emit('change');
		},
		deleteSectionById: function(payload) {
			this.removeSection(this.getSectionById(payload.id));
			this.emit('change');
		},
		monitorAction: function(payload) {
			var AM = CommonConsts.enums.actionManager;
			if (payload.owner !== AM.levels.SECTION) {
				return false;
			}
			switch (payload.name) {
				case AM.publicCommands.REMOVE_SIZE_FROM_SECTION:
					this.waitFor([stores.ACTION_STORE], function(ActionsStore) {
						var action = ActionsStore.getActionBykey(payload.owner, payload.ownerId, payload.audienceId, AM.actions.SIZES);
						if (!action || _.isEmpty(action.value)) {
							var section = this.getSectionById(payload.ownerId);
							this.removeSection(section);
						}
					}.bind(this));
					break;
				default:
					break;
			}
		},
		getAllAudiencesFromSection: function(payload) {
			this.emit('change');
		},
		loadSections: function(payload) {
			this.waitFor([stores.CHANNEL_STORE], function(ChannelStore) {
				_(payload.channels).each(function(channelJSON) {
					_(channelJSON.structuredSections ? channelJSON.structuredSections : channelJSON.sections || []).each(function(sectionJSON) {
						this.sections.push(Section.load(sectionJSON));
					}.bind(this));
				}.bind(this));
				this.emit('change');
			}.bind(this));
		},
		loadChannelSections: function(payload) {
			var channelJSON = payload.channelJSON;
			this.waitFor([stores.CHANNEL_STORE], function(ChannelStore) {
				_(channelJSON.structuredSections ? channelJSON.structuredSections : channelJSON.sections || []).each(function(sectionJSON) {
					this.sections.push(Section.load(sectionJSON));
				}.bind(this));
				this.emit('change');
			}.bind(this));
		},
		onStatsSuccess: function(payload) {
			var stats = payload.stats, actionManager = this.flux.store(stores.ACTION_STORE), allStats = {};
			this.waitFor([stores.CHANNEL_STORE], function() {
				_(stats.platforms).each(function(platformData, platform) {
					_(platformData.pageGroups).each(function(pageGroupData, pageGroup) {
						var chnl = this.flux.store(stores.CHANNEL_STORE).getChannelByPlatformAndPageGroup(platform, pageGroup);
						if (!chnl || chnl.statsStatus !== CommonConsts.enums.status.LOADED) {
							return true;
						}

						_(this.getChannelSection(chnl.id)).each(function(chnl, section) {
							var structuredSectionStats = (pageGroupData.structured && pageGroupData.structured[section.sectionMd5]) ? pageGroupData.structured[section.sectionMd5] : [],
								sectionStatsObj = {},
								sectionAds = actionManager.getSectionAds(section.id, chnl.id);
							sectionAds = Array.isArray(sectionAds) ? sectionAds : [];

							function getVariationStats(variationName) {
								return structuredSectionStats && structuredSectionStats.variations ? structuredSectionStats.variations[variationName] : null;
							}

							function enrichGroupData(groupData) {
								var data = {};
								_(groupData).each(function(ads, key) {
									var obj = null;
									if (ads.length && ads.length > 1) {
										obj = _(ads).reduce(function(a, b) {
											return {
												impressions: typeof (a) === 'object' ? a.impressions + b.impressions : b.impressions,
												clicks: typeof (a) === 'object' ? a.clicks + b.clicks : b.clicks,
												xpathMiss: typeof (a) === 'object' ? a.xpathMiss + b.xpathMiss : b.xpathMiss,
												ActiveViews: typeof (a) === 'object' ? a.ActiveViews + b.ActiveViews : b.ActiveViews
											};
										});
									} else {
										obj = {
											impressions: ads[0].impressions || 0,
											clicks: ads[0].clicks || 0,
											xpathMiss: ads[0].xpathMiss || 0,
											ActiveViews: ads[0].ActiveViews || 0
										};
									}
									obj.variations = ads;
									data[key] = obj;
								});
								return data;
							}

							/* section stats*/
							sectionStatsObj['impressions'] = structuredSectionStats.impressions || 0;
							sectionStatsObj['clicks'] = structuredSectionStats.clicks || 0;
							sectionStatsObj['xpathMiss'] = structuredSectionStats.xpathMisses || 0;
							sectionStatsObj['ActiveViews'] = structuredSectionStats.activeViews || 0;

							/* Enrich Ads With data*/
							sectionAds = _(sectionAds).map(function(ad) {
								var variationStats = getVariationStats(ad.variationName);
								ad['size'] = ad.width + ' X ' + ad.height;
								ad['name'] = ad.variationName;
								if (variationStats) {
									ad['impressions'] = variationStats.impressions;
									ad['clicks'] = variationStats.clicks;
									ad['xpathMiss'] = variationStats.xpathMisses;
									ad['ActiveViews'] = variationStats.activeViews;
								} else {
									ad['impressions'] = 0;
									ad['clicks'] = 0;
									ad['xpathMiss'] = 0;
									ad['ActiveViews'] = 0;
								}
								return ad;
							});

							/* Group By Network*/
							var statsByNetwork = enrichGroupData(_(sectionAds).groupBy('network')), finalData = {};

							_(statsByNetwork).each(function(networkData, key) {
								var statsBySize = enrichGroupData(_(_(networkData.variations).groupBy('size')));
								delete networkData.variations;
								networkData.sizesStats = statsBySize;
								finalData[key] = networkData;
							});
							sectionStatsObj['networkStats'] = finalData;
							section.stats = sectionStatsObj;
						}.bind(this, chnl));
					}.bind(this));
				}.bind(this));
				this.emit('change');
			}.bind(this));
		},
		scrollSectionToScreen: function(section) {
			this.messenger.sendMessage(ADP.enums.messenger.SCROLL_SECTION_TO_SCREEN, { sectionId: section.id });
		},
		unloadChannelSection: function(payload) {
			this.waitFor([stores.CHANNEL_STORE, stores.ACTION_STORE], function(channelStore) {
				this.sections = _(this.sections).reject({ channelId: payload.channel.id });
			}.bind(this));
		},
		getState: function() {
			return { sections: this.sections };
		},
		toJSON: function() {
			return { sections: this.sections };
		}
	});

	return SectionStore;
})();
