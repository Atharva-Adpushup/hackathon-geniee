var moment = require('moment'),
	CC = require('../../configs/commonConsts'),
	extend = require('extend'),
	Promise = require('bluebird'),
	AdPushupError = require('../../helpers/AdPushupError'),
	genieeReportService = require('../partners/geniee/service'),
	apexVariationReportService = require('../default/apex/service');

function getReportData(paramConfig) {
	var reportConfig = {
			siteId: paramConfig.siteId,
			startDate: moment(paramConfig.dateFrom).startOf('day').valueOf(),
			endDate: moment().subtract(0, 'days').endOf('day').valueOf()
		},
		statusObj = {
			status: null,
			data: null
		};

	return apexVariationReportService.getReportData(reportConfig)
		.then(function(reportData) {
			statusObj.status = 1;
			statusObj.data = extend(true, {}, reportData);

			return statusObj;
		}).catch(function(e) {
			/**********NOTE: SPECIAL CONDITION (APEX REPORTS)**********/
			// Only return variations payload without apex reports data when
			// Apex reports return an empty report for any variation
			// & consequently throws below exception message
			if (e && (e instanceof AdPushupError) && e.message && e.message === CC.exceptions.str.apexServiceDataEmpty) {
				statusObj.status = 0;
				statusObj.data = null;
				return statusObj;
			}

			throw e;
		});
}

function getGenieeReportData(paramConfig) {
	var statusObj = {
		status: null,
		data: null
	};

	return genieeReportService.getReport(paramConfig).then(function(reportData) {
		statusObj.status = 1;
		statusObj.data = extend(true, {}, reportData);
		
		return statusObj;
	}).catch(function(e) {
		/**********NOTE: SPECIAL CONDITION (GENIEE REPORTS)**********/
		// Only return variations payload without geniee reports data when
		// Geniee reports return an empty Array [] & consequently throws below exception message
		if (e && (e instanceof AdPushupError) && e.message && e.message === CC.partners.geniee.exceptions.str.zonesEmpty) {
			statusObj.status = 0;
			statusObj.data = null;
			return statusObj;
		}

		throw e;
	});
}    

function getComputedConfig(flags, paramConfig) {
	if (flags.isGenieePartner) {
		return getGenieeReportData(paramConfig);
	} else if (flags.isAutoOptimise) {
		return getReportData(paramConfig);
	} else if (!flags.isGenieePartner && !flags.isAutoOptimise) {
		return {status: 0, data: null};
	}
}

module.exports = {
	getReportData: function(site, inputStartDate, inputEndDate) {
        // return Promise.resolve();
		var isAutoOptimise = !!(site.get('apConfigs') && site.get('apConfigs').autoOptimise),
			isGenieePartner = (!!(site.get('partner') && (site.get('partner') === CC.partners.geniee.name) && site.get('genieeMediaId') && isAutoOptimise)),
			// NOTE: A date after which console.adpushup.com was made live
			// This date is chosen as startDate to get data parameters (page views, clicks etc) for every site
			// from its day one
			startDate = "20161201",
			// NOTE: 'keenIODate', A date on which Keen IO page views integration was 
			// made live in production. This date has been temporarily chosen as Geniee Reports 'dateFrom'
			// till SQL reporting is not production ready
			keenIODate = "20170601",
			computedStartDate = isGenieePartner ? keenIODate : startDate,
			paramConfig = {
				siteId: site.get('siteId'),
				mediaId: site.get('genieeMediaId'),
				dateFrom: (inputStartDate) ? moment(inputStartDate).format('YYYY-MM-DD') : moment(computedStartDate).format('YYYY-MM-DD'),
				dateTo: (inputEndDate) ? moment(inputEndDate).format('YYYY-MM-DD') : moment().subtract(1, 'days').format('YYYY-MM-DD')
			},
			flags = {
				isGenieePartner: isGenieePartner,
				isAutoOptimise: isAutoOptimise
			};

		return Promise.resolve(true).then(function() {
			return getComputedConfig(flags, paramConfig);
		});
	}
};
