module.exports = [
	{
		isActive: true,
		triggers: [
			{
				key: 'device',
				operator: 'contain',
				value: ['tab', 'mobile'] // desktop,  mobile, tablet
			},
			{
				key: 'country',
				operator: 'contain',
				value: ['IN']
			},
			/**
			 * TODO: [HbRules] remove this comment
			 *
			 * night: '20:00-05:59'
			 * morning: '06:00-11:59'
			 * afternoon: '12:00-15:59'
			 * evening: '16:00-19:59'
			 */
			{
				key: 'time_range',
				operator: 'contain',
				value: ['06:00-11:59', '12:00-15:59']
			},
			/**
			 * TODO: [HbRules] Remove this comment
			 *
			 * weekday: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
			 * weekend: ['saturday', 'sunday']
			 */
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
		],
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
		createdAt: 1592304084229
	},
	{
		isActive: true,
		triggers: [
			{
				key: 'device',
				operator: 'contain',
				value: ['desktop', 'mobile'] // desktop,  mobile, tablet
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
		],
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
				key: 'disable_header_bidding'
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
		createdAt: 1592894410251
	}
];
