const SITE_SETUP_STATUS = {
	0: {
		step: 0,
		tooltipText: 'Onboarding is incomplete',
		text: 'Please complete onboarding process',
		isComplete: false,
		type: 'danger',
		icon: 'exclamation-triangle'
	},
	1: {
		step: 1,
		tooltipText: 'Onboarding is incomplete',
		text: 'AP head code is not present',
		isComplete: false,
		type: 'danger',
		icon: 'exclamation-triangle'
	},
	2: {
		step: 2,
		tooltipText: 'Onboarding is incomplete',
		text: 'Ads.txt is not updated',
		isComplete: false,
		type: 'danger',
		icon: 'exclamation-triangle'
	},
	3: {
		step: 3,
		tooltipText: 'Onboarding is incomplete',
		text: 'No App is activated',
		isComplete: false,
		type: 'warning',
		icon: 'exclamation-circle'
	},
	4: {
		step: 4,
		tooltipText: 'Onboarding is complete',
		text: 'AdPushup is running',
		isComplete: true,
		type: 'success',
		icon: 'check-circle'
	}
};

const rightTrim = (string, s) => (string ? string.replace(new RegExp(s + '*$'), '') : '');

const domanize = domain =>
	domain
		? rightTrim(
				domain
					.replace('http://', '')
					.replace('https://', '')
					.replace('www.', ''),
				'/'
		  )
		: '';

module.exports = { SITE_SETUP_STATUS, rightTrim, domanize };
