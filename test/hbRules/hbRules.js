const assert = require('chai').assert;
const sinon = require('sinon');

const { dataVariation1, dataVariation2 } = require('./mockedData');
const hbRulesModule = require('../../services/genieeAdSyncService/adpushup.js/modules/adpTags/hbScript/src/hbRules');

describe('Inject dependencies and init the hbRulesModule', function() {
	// Variation 1
	var { dependencies } = dataVariation1;
	it('should throw error if all dependencies not passed', function() {
		const deps = {};
		assert.throws(hbRulesModule.bind(null, deps), /Missing dependencies for HB Rules:/);
	});

	it('should return back hbRules object if all dependencies passed', function() {
		assert.hasAllKeys(hbRulesModule(dependencies), [
			'isHbRuleTriggerMatch',
			'getMatchedHbRules',
			'getComputedActions',
			'getDataByRules'
		]);
	});
});

describe('check whether a trigger matches or not', function() {
	var currentVariation = 1,
		isGivenTimeExistsInTimeRanges,
		clock;
	beforeEach(function() {
		if (currentVariation === 1) {
			isGivenTimeExistsInTimeRanges = sinon
				.stub(dataVariation1.dependencies.utils, 'isGivenTimeExistsInTimeRanges')
				.returns(true);
			clock = sinon.useFakeTimers(dataVariation1.currentTime.getTime());
		}

		if (currentVariation === 2) {
			isGivenTimeExistsInTimeRanges = sinon
				.stub(dataVariation2.dependencies.utils, 'isGivenTimeExistsInTimeRanges')
				.returns(false);
			clock = sinon.useFakeTimers(dataVariation2.currentTime.getTime());
		}
	});
	afterEach(function() {
		isGivenTimeExistsInTimeRanges.restore();
		clock.restore();

		currentVariation++;
	});

	it('should match all triggers', function() {
		var hbRulesModuleAPI = hbRulesModule(dataVariation1.dependencies);
		dataVariation1.rules[0].triggers.forEach(trigger => {
			if (!hbRulesModuleAPI.isHbRuleTriggerMatch(trigger, dataVariation1.sectionName)) {
				console.log('trigger: ', trigger);
			}
			assert.isTrue(hbRulesModuleAPI.isHbRuleTriggerMatch(trigger, dataVariation1.sectionName));
		});
	});

	it("shouldn't match any trigger", function() {
		var hbRulesModuleAPI = hbRulesModule(dataVariation2.dependencies);
		dataVariation2.rules[0].triggers.forEach(trigger => {
			assert.isFalse(hbRulesModuleAPI.isHbRuleTriggerMatch(trigger, dataVariation2.sectionName));
		});
	});
});

describe('check and return matched hb rules', function() {
	var currentVariation = 1,
		hbRulesModuleAPI,
		isHbRuleTriggerMatch;
	beforeEach(function() {
		if (currentVariation === 1) {
			hbRulesModuleAPI = hbRulesModule(dataVariation1.dependencies);
			isHbRuleTriggerMatch = sinon.stub(hbRulesModuleAPI, 'isHbRuleTriggerMatch').returns(true);
		}

		if (currentVariation === 2) {
			hbRulesModuleAPI = hbRulesModule(dataVariation2.dependencies);
			isHbRuleTriggerMatch = sinon.stub(hbRulesModuleAPI, 'isHbRuleTriggerMatch').returns(false);
		}
	});
	afterEach(function() {
		isHbRuleTriggerMatch.restore();
		currentVariation++;
	});

	it('should match all HB rules', function() {
		assert.deepEqual(
			hbRulesModuleAPI.getMatchedHbRules(dataVariation1.sectionName),
			dataVariation1.rules
		);
	});

	it("shouldn't match any HB rule", function() {
		assert.lengthOf(hbRulesModuleAPI.getMatchedHbRules(dataVariation2.sectionName), 0);
	});
});

describe('process and return computed actions', function() {
	it('should return some computed actions', function() {
		var hbRulesModuleAPI = hbRulesModule(dataVariation1.dependencies);

		assert.deepEqual(
			hbRulesModuleAPI.getComputedActions(dataVariation1.rules),
			dataVariation1.computedActions
		);
	});

	it("shouldn't return any computed action", function() {
		var hbRulesModuleAPI = hbRulesModule(dataVariation2.dependencies);

		assert.deepEqual(hbRulesModuleAPI.getComputedActions([]), dataVariation2.computedActions);
	});
});

describe('process hb rules and return computed data', function() {
	var currentVariation = 1,
		getBiddersForSlot,
		hbRulesModuleAPI,
		getMatchedHbRules,
		getComputedActions;

	beforeEach(function() {
		if (currentVariation === 1) {
			getBiddersForSlot = sinon
				.stub(dataVariation1.dependencies.utils, 'getBiddersForSlot')
				.returns(['appnexus', 'rubicon']);

			hbRulesModuleAPI = hbRulesModule(dataVariation1.dependencies);
			getMatchedHbRules = sinon
				.stub(hbRulesModuleAPI, 'getMatchedHbRules')
				.returns(dataVariation1.rules);
			getComputedActions = sinon
				.stub(hbRulesModuleAPI, 'getComputedActions')
				.returns(dataVariation1.computedActions);
		}

		if (currentVariation === 2) {
			getBiddersForSlot = sinon
				.stub(dataVariation2.dependencies.utils, 'getBiddersForSlot')
				.returns(['appnexus', 'rubicon']);

			hbRulesModuleAPI = hbRulesModule(dataVariation2.dependencies);
			getMatchedHbRules = sinon.stub(hbRulesModuleAPI, 'getMatchedHbRules').returns([]);
			getComputedActions = sinon
				.stub(hbRulesModuleAPI, 'getComputedActions')
				.returns(dataVariation2.computedActions);
		}
	});
	afterEach(function() {
		getBiddersForSlot.restore();
		getMatchedHbRules.restore();
		getComputedActions.restore();

		currentVariation++;
	});

	// Variation 1

	it('should return computed data by rules and do other side effects', function() {
		var computedFormats = dataVariation1.computedActions.find(action => action.key === 'formats');
		assert.deepEqual(
			hbRulesModuleAPI.getDataByRules(
				dataVariation1.size,
				dataVariation1.formats,
				dataVariation1.sectionName
			),
			{
				bidders: ['appnexus', 'rubicon'],
				formats: computedFormats ? computedFormats.value : undefined
			}
		);

		// Check Side effects
		assert.isTrue(
			dataVariation1.dependencies.config.PREBID_CONFIG.prebidConfig.enableBidderSequence
		);

		var refreshTimeOut = dataVariation1.computedActions.find(
			action => action.key === 'refresh_timeout'
		).value;
		assert.equal(
			dataVariation1.dependencies.config.PREBID_CONFIG.prebidConfig.refreshTimeOut,
			refreshTimeOut
		);
		assert.equal(
			dataVariation1.dependencies.config.PREBID_CONFIG.amazonUAMConfig.refreshTimeOut,
			refreshTimeOut
		);

		var timeOut = dataVariation1.computedActions.find(action => action.key === 'initial_timeout')
			.value;
		assert.equal(dataVariation1.dependencies.config.PREBID_CONFIG.prebidConfig.timeOut, timeOut);
		assert.equal(dataVariation1.dependencies.config.PREBID_CONFIG.amazonUAMConfig.timeOut, timeOut);
	});

	it("shouldn't return any computed data or do side effects if rules don't match", function() {
		var computedFormats = dataVariation2.computedActions.find(action => action.key === 'formats');
		var dataByRulesOutput = {
			bidders: ['appnexus', 'rubicon']
		};
		if (computedFormats) dataByRulesOutput.formats = computedFormats.value;

		assert.deepEqual(
			hbRulesModuleAPI.getDataByRules(
				dataVariation2.size,
				dataVariation2.formats,
				dataVariation2.sectionName
			),
			dataByRulesOutput
		);

		// Check Side effects
		assert.isUndefined(
			dataVariation2.dependencies.config.PREBID_CONFIG.prebidConfig.enableBidderSequence
		);

		assert.equal(
			dataVariation2.dependencies.config.PREBID_CONFIG.prebidConfig.refreshTimeOut,
			dataVariation2.defaultTimeouts.refreshTimeOut
		);
		assert.equal(
			dataVariation2.dependencies.config.PREBID_CONFIG.amazonUAMConfig.refreshTimeOut,
			dataVariation2.defaultTimeouts.refreshTimeOut
		);

		assert.equal(
			dataVariation2.dependencies.config.PREBID_CONFIG.prebidConfig.timeOut,
			dataVariation2.defaultTimeouts.timeOut
		);
		assert.equal(
			dataVariation2.dependencies.config.PREBID_CONFIG.amazonUAMConfig.timeOut,
			dataVariation2.defaultTimeouts.timeOut
		);
	});
});
