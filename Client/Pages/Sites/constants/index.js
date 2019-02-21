const SITE_SETUP_STATUS = {
	1: {
		step: 1,
		tooltipText: 'Setup is incomplete',
		text: 'AP head code is not present',
		isComplete: false,
		type: 'danger',
		icon: 'exclamation-triangle'
	},
	2: {
		step: 2,
		tooltipText: 'Setup is incomplete',
		text: 'Ads.txt not updated',
		isComplete: false,
		type: 'danger',
		icon: 'exclamation-triangle'
	},
	3: {
		step: 3,
		tooltipText: 'Setup is incomplete',
		text: 'No App is activated',
		isComplete: false,
		type: 'warning',
		icon: 'exclamation-circle'
	},
	4: {
		step: 4,
		tooltipText: 'Setup is complete',
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
