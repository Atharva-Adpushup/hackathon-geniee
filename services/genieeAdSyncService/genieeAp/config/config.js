var utils = require('../libs/utils');
module.exports = {
	ver: 1.0,
	// eslint-disable-next-line no-undef
	siteId: _xxxxx_,
	// eslint-disable-next-line no-undef
	packetId: utils.uniqueId(_xxxxx_),
	feedbackUrl: '//e3.adpushup.com/ApexWebService/feedback',
	heartBeatMinInterval: 30000,
	heartBeatStartDelay: 2000,
	xpathWaitTimeout: 5000,
	contentSelector: null,
	adpushupPercentage: 100,
	serveAmpTagsForAdp: true,
	pageGroupTimeout: 0,
	mode: 2,
	domain: '',
	forceVariation: 'forceVariation',
	pageUrl: window.location.href,
	referrer: document.referrer
};
