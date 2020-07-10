module.exports = function(dependencies) {
	var requiredDependencies = ['config', 'utils', 'adpushup'];
	var missingDependencies = requiredDependencies.filter(
		requiredDependency => dependencies[requiredDependency] === undefined
	);

	if (missingDependencies.length)
		throw new Error(`Missing dependencies for HB Rules: ${missingDependencies.join(', ')}`);

	var { config, utils, adpushup } = dependencies;

	var api = {
		isHbRuleTriggerMatch(trigger, sectionId) {
			function isMatch(triggerValue, triggerValueType, currentValue, operator) {
				var matched;

				switch (triggerValueType) {
					case 'array': {
						matched = triggerValue.indexOf(currentValue) !== -1;

						break;
					}
					case 'boolean': {
						matched = triggerValue;

						break;
					}
				}

				return operator === 'contain' ? matched : !matched;
			}

			switch (trigger.key) {
				case 'device': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var currentDevice = adpushup.config.platform.toLowerCase();

					return isMatch(trigger.value, 'array', currentDevice, trigger.operator);
				}
				case 'country': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var currentCountry = 'IN'; // TODO: [HbRules] Add get currentCountry Feature

					return isMatch(trigger.value, 'array', currentCountry, trigger.operator);
				}
				case 'time_range': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var timeNow = new Date();

					var isTimeMatch = utils.isGivenTimeExistsInTimeRanges(timeNow, trigger.value);

					return isMatch(isTimeMatch, 'boolean', timeNow, trigger.operator);
				}
				case 'day_of_the_week': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					var days = [
						'sunday',
						'monday',
						'tuesday',
						'wednesday',
						'thursday',
						'friday',
						'saturday'
					];
					var todayIndex = new Date().getDay();
					var today = days[todayIndex];

					return isMatch(trigger.value, 'array', today, trigger.operator);
				}
				case 'adunit': {
					if (!(Array.isArray(trigger.value) && trigger.value.length)) return false;

					return isMatch(trigger.value, 'array', sectionId, trigger.operator);
				}
			}
		},
		getMatchedHbRules(sectionId) {
			var rules = config.PREBID_CONFIG.rules || [];

			matchedRules = rules.filter(rule => {
				var isActive = rule.isActive !== false; // we assumed a rule is active until it's defined as inactive.

				if (!isActive) return false;

				var ruleMatched = true;

				/**
				 * An Hb rule will match if it's all triggers matches
				 */
				for (var i = 0; i < rule.triggers.length; i++) {
					var trigger = rule.triggers[i];
					ruleMatched = this.isHbRuleTriggerMatch(trigger, sectionId);

					if (!ruleMatched) break;
				}

				return ruleMatched;
			});

			return matchedRules;
		},
		getComputedActions(hbRules) {
			if (!Array.isArray(hbRules) || !hbRules.length) return [];

			if (hbRules.length === 1) return hbRules[0].actions;

			/**
			 * If there are multiple rules then merge their actions.
			 * In case of duplicate action, choose the latest created rule action
			 */
			var actionsMapping = {};
			hbRules.forEach(hbRule => {
				for (var i = 0; i < hbRule.actions.length; i++) {
					var action = hbRule.actions[i];
					var currentActionDate = new Date(hbRule.createdAt);
					var oldActionDate =
						actionsMapping[action.key] &&
						new Date(actionsMapping[action.key].createdAt);

					if (!actionsMapping[action.key] || currentActionDate > oldActionDate) {
						actionsMapping[action.key] = {
							action: action,
							createdAt: hbRule.createdAt
						};

						continue;
					}
				}
			});

			var computedActions = Object.keys(actionsMapping).map(
				key => actionsMapping[key].action
			);

			return computedActions;
		},
		getDataByRules(size, formats, sectionId) {
			var outputData = {};

			var matchedHbRules = this.getMatchedHbRules(sectionId);
			var actions = this.getComputedActions(matchedHbRules);

			// TODO: [HbRules] Remove temp console logs
			console.log('matchedHbRules', matchedHbRules);
			console.log('actions', actions);

			var bidderRulesConfig = {};

			// if rule matches then apply actions
			actions.forEach(action => {
				switch (action.key) {
					// slotwise
					case 'allowed_bidders': {
						if (Array.isArray(action.value) && action.value.length) {
							bidderRulesConfig.allowedBidders = action.value;
						}

						break;
					}
					// slotwise
					case 'bidders_order': {
						if (Array.isArray(action.value) && action.value.length) {
							bidderRulesConfig.bidderSequence = action.value;

							config.PREBID_CONFIG.prebidConfig.enableBidderSequence = true;
						}

						break;
					}
					// slotwise
					case 'disable_header_bidding': {
						outputData.headerBidding = false;

						break;
					}
					// slotwise
					case 'formats': {
						if (
							Array.isArray(action.value) &&
							action.value.length &&
							action.value.indexOf('display') !== -1
						) {
							bidderRulesConfig.formats = action.value;
							outputData.formats = action.value;
						}

						break;
					}
					// prebid-batch-wise
					case 'refresh_timeout': {
						var refreshTimeOut = parseInt(action.value, 10);
						if (!isNaN(refreshTimeOut)) {
							config.PREBID_CONFIG.prebidConfig.refreshTimeOut = refreshTimeOut;

							var isAmazonUAMActive =
								config.PREBID_CONFIG &&
								config.PREBID_CONFIG.amazonUAMConfig &&
								config.PREBID_CONFIG.amazonUAMConfig.isAmazonUAMActive &&
								config.PREBID_CONFIG.amazonUAMConfig.publisherId;

							if (isAmazonUAMActive) {
								config.PREBID_CONFIG.amazonUAMConfig.refreshTimeOut = refreshTimeOut;
							}
						}

						break;
					}
					// prebid-batch-wise
					case 'initial_timeout': {
						var initialTimeOut = parseInt(action.value, 10);
						if (!isNaN(initialTimeOut)) {
							config.PREBID_CONFIG.prebidConfig.timeOut = initialTimeOut;

							var isAmazonUAMActive =
								config.PREBID_CONFIG &&
								config.PREBID_CONFIG.amazonUAMConfig &&
								config.PREBID_CONFIG.amazonUAMConfig.isAmazonUAMActive &&
								config.PREBID_CONFIG.amazonUAMConfig.publisherId;

							if (isAmazonUAMActive) {
								config.PREBID_CONFIG.amazonUAMConfig.timeOut = initialTimeOut;
							}
						}

						break;
					}
				}
			});

			/**
			 * Compute bidders only if headerbidding is not
			 * disabled by "disable_header_bidding" action
			 */
			outputData.bidders =
				outputData.headerBidding !== false
					? utils.getBiddersForSlot(size, formats, bidderRulesConfig)
					: [];

			// TODO: [HbRules] Remove temp console logs
			console.log('dataByRules', outputData);

			return outputData;
		}
	};

	return api;
};
