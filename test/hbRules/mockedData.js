var merge = require('lodash/merge');

var commonData = {
	dependencies: {
		utils: {
			isGivenTimeExistsInTimeRanges: function() {},
			getBiddersForSlot: function() {}
		},
		config: {
			PREBID_CONFIG: {
				rules: [],
				prebidConfig: { refreshTimeOut: 3000, timeOut: 3000 },
				amazonUAMConfig: {
					isAmazonUAMActive: true,
					publisherId: 'fake_id',
					refreshTimeOut: 3000,
					timeOut: 3000
				}
			}
		},
		adpushup: {
			config: { platform: 'desktop' }
		}
	},
	size: ['300x600'],
	formats: ['display', 'video'],
	sectionName: 'AP_L_D_POST-PAGE_728X90_56074',
	defaultTimeouts: { refreshTimeOut: 3000, timeOut: 3000 }
};

function getDataVariation1() {
	var rules = [
		{
			actions: [
				{
					key: 'allowed_bidders',
					value: ['pubmatic', 'sovrn', 'critio', 'adyoulike']
				},
				{
					key: 'bidders_order',
					value: ['adyoulike', 'sovrn']
				},
				{
					key: 'refresh_timeout',
					value: 2000
				},
				{
					key: 'initial_timeout',
					value: 2600
				},
				{
					key: 'formats',
					value: ['display', 'video', 'native']
				}
			],
			createdAt: 1592304084229,
			isActive: true,
			triggers: [
				{
					key: 'device',
					operator: 'not_contain',
					value: ['tab', 'mobile']
				},
				{
					key: 'country',
					operator: 'contain',
					value: ['IN']
				},
				{
					key: 'time_range',
					operator: 'contain',
					value: ['06:00-11:59', '12:00-15:59']
				},
				{
					key: 'day_of_the_week',
					operator: 'contain',
					value: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
				},
				{
					key: 'adunit',
					operator: 'contain',
					value: ['AP_L_D_POST-PAGE_728X90_56074']
				}
			]
		},
		{
			actions: [
				{
					key: 'allowed_bidders',
					value: ['pubmatic', 'sovrn', 'critio', 'adyoulike']
				},
				{
					key: 'bidders_order',
					value: ['adyoulike', 'sovrn']
				},
				{
					key: 'refresh_timeout',
					value: 2100
				},
				{
					key: 'formats',
					value: ['display', 'native']
				}
			],
			createdAt: 1592894410251,
			isActive: true,
			triggers: [
				{
					key: 'device',
					operator: 'not_contain',
					value: ['desktop', 'mobile']
				},
				{
					key: 'country',
					operator: 'contain',
					value: ['IN']
				},
				{
					key: 'time_range',
					operator: 'contain',
					value: ['06:00-11:59', '12:00-23:59']
				},
				{
					key: 'day_of_the_week',
					operator: 'contain',
					value: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
				}
			]
		}
	];

	var data = {
		rules,
		computedActions: [
			{
				key: 'allowed_bidders',
				value: ['pubmatic', 'sovrn', 'critio', 'adyoulike']
			},
			{
				key: 'bidders_order',
				value: ['adyoulike', 'sovrn']
			},
			{
				key: 'refresh_timeout',
				value: 2100
			},
			{
				key: 'initial_timeout',
				value: 2600
			},
			{
				key: 'formats',
				value: ['display', 'native']
			}
		],
		currentTime: new Date('2020-06-25 13:10'),
		dependencies: {
			config: {
				PREBID_CONFIG: {
					rules
				}
			},
			adpushup: {
				config: { platform: 'desktop' }
			}
		}
	};

	return merge({}, commonData, data);
}

function getDataVariation2() {
	var rules = [
		{
			actions: [
				{
					key: 'allowed_bidders',
					value: ['pubmatic', 'sovrn', 'critio', 'adyoulike']
				},
				{
					key: 'bidders_order',
					value: ['adyoulike', 'sovrn']
				},
				{
					key: 'refresh_timeout',
					value: 2000
				},
				{
					key: 'initial_timeout',
					value: 2600
				},
				{
					key: 'formats',
					value: ['display', 'video']
				}
			],
			createdAt: 1592304084229,
			isActive: true,
			triggers: [
				{
					key: 'device',
					operator: 'contain',
					value: ['tab', 'mobile']
				},
				{
					key: 'country',
					operator: 'not_contain',
					value: ['IN']
				},
				{
					key: 'time_range',
					operator: 'contain',
					value: ['06:00-11:59', '12:00-15:59']
				},
				{
					key: 'day_of_the_week',
					operator: 'contain',
					value: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
				},
				{
					key: 'adunit',
					operator: 'not_contain',
					value: ['AP_L_D_POST-PAGE_728X90_56074']
				}
			]
		},
		{
			actions: [
				{
					key: 'allowed_bidders',
					value: ['pubmatic', 'sovrn', 'critio', 'adyoulike']
				},
				{
					key: 'bidders_order',
					value: ['adyoulike', 'sovrn']
				},
				{
					key: 'refresh_timeout',
					value: 2100
				},
				{
					key: 'formats',
					value: ['display', 'video', 'native']
				}
			],
			createdAt: 1592894410251,
			isActive: true,
			triggers: [
				{
					key: 'device',
					operator: 'contain',
					value: ['mobile']
				},
				{
					key: 'country',
					operator: 'contain',
					value: ['US']
				},
				{
					key: 'time_range',
					operator: 'contain',
					value: ['06:00-11:59']
				},
				{
					key: 'day_of_the_week',
					operator: 'not_contain',
					value: ['saturday', 'sunday']
				}
			]
		}
	];

	var data = {
		rules,
		computedActions: [],
		currentTime: new Date('2020-06-27 23:00'),
		dependencies: {
			config: {
				PREBID_CONFIG: {
					rules
				}
			},
			adpushup: {
				config: { platform: 'desktop' }
			}
		}
	};

	return merge({}, commonData, data);
}

module.exports.dataVariation1 = getDataVariation1();
module.exports.dataVariation2 = getDataVariation2();
