module.exports = {
	ver: 1.0,
	// eslint-disable-next-line no-undef
	siteId: __SITE_ID__,
	// eslint-disable-next-line no-undef
	country: __COUNTRY__,
	feedbackUrl: '//e3.adpushup.com/AdPushupFeedbackWebService/feedback?data=',
	feedbackUrlOld: '//e3.adpushup.com/ApexWebService/feedback',
	heartBeatMinInterval: 30000,
	heartBeatStartDelay: 2000,
	xpathWaitTimeout: 5000,
	contentSelector: null,
	adpushupPercentage: 100,
	serveAmpTagsForAdp: false,
	pageGroupTimeout: 0,
	mode: 2,
	domain: '',
	forceVariation: 'forceVariation',
	pageUrl: window.location.href,
	referrer: document.referrer
};