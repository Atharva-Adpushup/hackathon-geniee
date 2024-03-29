const SITE_SETUP_STATUS = {
	0: {
		step: 0,
		type: 'danger',
		icon: 'exclamation-triangle',
		tooltipText: 'Onboarding is incomplete',
		onboarding: {
			icon: 'exclamation-triangle',
			isComplete: false,
			text: 'Please complete onboarding process',
			link: '/onboarding?siteId=__SITEID__',
			linkText: 'Complete Setup'
		},
		site: {}
	},
	1: {
		step: 1,
		type: 'danger',
		icon: 'exclamation-triangle',
		tooltipText: 'Onboarding is incomplete',
		onboarding: {
			icon: 'exclamation-triangle',
			isComplete: false,
			text: 'AP head code is not present',
			link: '/onboarding?siteId=__SITEID__',
			linkText: 'Complete Setup'
		},
		site: {}
	},
	2: {
		step: 1,
		type: 'danger',
		icon: 'exclamation-triangle',
		tooltipText: 'Onboarding is incomplete',
		onboarding: {
			icon: 'exclamation-triangle',
			isComplete: false,
			text: 'Ads.txt is not updated',
			link: '/onboarding?siteId=__SITEID__',
			linkText: 'Complete Setup'
		},
		site: {}
	},
	3: {
		step: 3,
		type: 'warning',
		icon: 'exclamation-circle',
		tooltipText: 'No App is activated',
		onboarding: {
			icon: 'check-circle',
			isComplete: true,
			text: 'Onboarding is complete',
			link: ''
		},
		site: {
			icon: 'exclamation-circle',
			isComplete: false,
			text: 'No App is activated',
			link: '/sites/__SITEID__/apps',
			linkText: 'Activate Apps'
		}
	},
	4: {
		step: 4,
		type: 'success',
		icon: 'check-circle',
		tooltipText: 'AdPushup is running',
		onboarding: {
			icon: 'check-circle',
			isComplete: true,
			text: 'Onboarding is complete',
			link: ''
		},
		site: {
			icon: 'check-circle',
			isComplete: true,
			text: 'AdPushup is running',
			link: ''
		}
	}
};

const rightTrim = (string, s) => (string ? string.replace(new RegExp(`${s}*$`), '') : '');

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

const FIRST_ONBOARDING_STEP = 0;
const USER_ONBOARDING_COMPLETE_STEP = 3;
const ADPUSHUP_RUNNING_SUCCESSFULLY_STEP = 4;

const FETCH_SITE_APP_STATUS_URL = '/site/fetchAppStatuses';

module.exports = {
	SITE_SETUP_STATUS,
	rightTrim,
	domanize,
	ADPUSHUP_RUNNING_SUCCESSFULLY_STEP,
	FIRST_ONBOARDING_STEP,
	USER_ONBOARDING_COMPLETE_STEP,
	FETCH_SITE_APP_STATUS_URL
};
