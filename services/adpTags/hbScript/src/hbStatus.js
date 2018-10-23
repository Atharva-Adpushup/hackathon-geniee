// Hb status module

var config = require('./config'),
	utils = require('../helpers/utils'),
	xhr = require('../helpers/xhr'),
	responseHandler = function(err, data) {
		err ? console.log(err) : console.log(data);
	},
	packetId =
		window.adpushup && window.adpushup.config && window.adpushup.config.packetId
			? window.adpushup.config.packetId
			: utils.generateUUID(),
	platform =
		window.adpushup && window.adpushup.config && window.adpushup.config.platform
			? window.adpushup.config.platform
			: utils.generateUUID(),
	hbStart = function(adUnits) {
		xhr(
			'POST',
			config.HB_STATUS.API_URL +
				config.HB_STATUS.EVENTS.HB_START +
				'?packetId=' +
				packetId +
				'&UA=' +
				utils.getBrowser() +
				'&ua_string=' +
				utils.getUaString() +
				'&siteId=' +
				config.SITE_ID +
				'&platform=' +
				platform +
				'&adUnit=' +
				adUnits,
			{},
			function(err, data) {
				responseHandler(err, data);
			},
			{ PostQuery: true }
		);
	},
	hbEnd = function(adUnits) {
		xhr(
			'POST',
			config.HB_STATUS.API_URL + config.HB_STATUS.EVENTS.HB_END + '?packetId=' + packetId + '&adUnit=' + adUnits,
			{},
			function(err, data) {
				responseHandler(err, data);
			},
			{ PostQuery: true }
		);
	},
	hbRender = function(adUnits) {
		xhr(
			'POST',
			config.HB_STATUS.API_URL +
				config.HB_STATUS.EVENTS.HB_RENDER +
				'?packetId=' +
				packetId +
				'&adUnit=' +
				adUnits,
			{},
			function(err, data) {
				responseHandler(err, data);
			},
			{ PostQuery: true }
		);
	},
	hbDfpRender = function(adUnit) {
		xhr(
			'POST',
			config.HB_STATUS.API_URL +
				config.HB_STATUS.EVENTS.HB_DFP_RENDER +
				'?packetId=' +
				packetId +
				'&adUnit=' +
				adUnit,
			{},
			function(err, data) {
				responseHandler(err, data);
			},
			{ PostQuery: true }
		);
	};

module.exports = {
	hbStart: hbStart,
	hbEnd: hbEnd,
	hbRender: hbRender,
	hbDfpRender: hbDfpRender
};
