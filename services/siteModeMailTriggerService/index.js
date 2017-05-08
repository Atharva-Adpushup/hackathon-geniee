const Promise = require('bluebird'),
	moment = require('moment'),
	extend = require('extend'),
	lodash = require('lodash'),
	{ isObject, replace } = lodash,
	CC = require('../../configs/commonConsts'),
	{ MESSAGES, SITE, DATE, DATA } = require('./constants/index'),
	{ KEYS, PERCENTAGE, MAIL } = DATA,
	universalReportService = require('../../reports/universal/index');

function validateReportData(oneDayBeforeData, twoDaysBeforeData, siteData) {
	const isOneDayBeforeData = !!(oneDayBeforeData && isObject(oneDayBeforeData) && oneDayBeforeData.data && isObject(oneDayBeforeData.data)),
		isOneDayBeforeDataRootLevelObject = !!(isOneDayBeforeData && oneDayBeforeData.data.media && (Object.keys(oneDayBeforeData.data.media).length === KEYS.MEDIA)
			&& oneDayBeforeData.data.pageGroups && (Object.keys(oneDayBeforeData.data.pageGroups).length >= KEYS.PAGEGROUPS)),

		isTwoDaysBeforeData = !!(twoDaysBeforeData && isObject(twoDaysBeforeData) && twoDaysBeforeData.data && isObject(twoDaysBeforeData.data)),
		isTwoDaysBeforeDataRootLevelObject = !!(isTwoDaysBeforeData && twoDaysBeforeData.data.media && (Object.keys(twoDaysBeforeData.data.media).length === KEYS.MEDIA)
			&& twoDaysBeforeData.data.pageGroups && (Object.keys(twoDaysBeforeData.data.pageGroups).length >= KEYS.PAGEGROUPS)),

		isValidData = (isOneDayBeforeDataRootLevelObject && isTwoDaysBeforeDataRootLevelObject),

		resultObject = {
			status: '',
			data: {},
			siteData
		};

	if (!isValidData) { throw new Error(MESSAGES.INVALID_DATA); }

	resultObject.status = MESSAGES.VALID_DATA;
	resultObject.data = {
		oneDayBefore: {
			pageViews: oneDayBeforeData.data.media.pageViews,
			revenue: oneDayBeforeData.data.media.revenue
		},
		twoDaysBefore: {
			pageViews: twoDaysBeforeData.data.media.pageViews,
			revenue: twoDaysBeforeData.data.media.revenue
		}
	};

	return Promise.resolve(resultObject);
}

function generateMailContent(dataObject) {
	const inputDataObj = extend(true, {}, dataObject),
		{ data, siteData } = inputDataObj,
		{ oneDayBefore, twoDaysBefore } = data,
		isModePublish = !!(siteData.mode && (SITE.MODE.PUBLISH.TYPE === siteData.mode)),
		isModeDraft = !!(siteData.mode && (SITE.MODE.DRAFT.TYPE === siteData.mode)),
		mailContentObj = {
			header: '',
			content: ''
		},

		isPageViews = !!((oneDayBefore.pageViews > 0) && (twoDaysBefore.pageViews > 0)),
		isRevenue = !!((oneDayBefore.revenue > 0) && (twoDaysBefore.revenue > 0)),
		isDataExists = !!(isPageViews || isRevenue),
		pageViewsPercentage = isPageViews ? (oneDayBefore.pageViews / twoDaysBefore.pageViews * 100) : null,
		isPageViewsInConsistent = !!(pageViewsPercentage && PERCENTAGE.PAGEVIEWS > pageViewsPercentage),
		revenuePercentage = isRevenue ? (oneDayBefore.revenue / twoDaysBefore.revenue * 100) : null,
		isRevenueInConsistent = !!(revenuePercentage && PERCENTAGE.REVENUE > revenuePercentage),
		isDataInConsistent = !!(isDataExists && (isPageViewsInConsistent || isRevenueInConsistent)),
		isInDraftMode = !!(isModeDraft && isDataExists),
		isDataInConsistency = !!(isModePublish && isDataInConsistent),
		
		reportTemplateString = `${lodash(MAIL.CONTENT.COMMON).replace('___odbPageViews___', oneDayBefore.pageViews).replace('___odbRevenue___', oneDayBefore.revenue).replace('___tdbPageViews___', twoDaysBefore.pageViews).replace('___tdbRevenue___', twoDaysBefore.revenue)}`;

		if (isInDraftMode) {
			mailContentObj.header = lodash(MAIL.CONTENT.DRAFT.HEADER).replace('___sitename___', siteData.domain).replace('___siteId___', siteData.id);
			mailContentObj.content = `${lodash(MAIL.CONTENT.DRAFT.CONTENT).replace('___sitename___', siteData.domain)} ${reportTemplateString}`;
		} else if (isDataInConsistency) {
			mailContentObj.header = lodash(MAIL.CONTENT.DATA_INCONSISTENT.HEADER).replace('___sitename___', siteData.domain).replace('___siteId___', siteData.id);
			mailContentObj.content = `${lodash(MAIL.CONTENT.DATA_INCONSISTENT.CONTENT).replace('___sitename___', siteData.domain)} ${reportTemplateString}`;
		}

		return mailContentObj;
}

function initModule(site, resolve, reject) {
	const isGenieePartner = !!(site.get('partner') && (site.get('partner') === CC.partners.geniee.name) && site.get('genieeMediaId'));

	if (!isGenieePartner) { return reject(new Error(MESSAGES.SITE_INVALID)); }

	const isMode = !!(site.get('apConfigs') && site.get('apConfigs').mode),
		siteMode = isMode ? site.get('apConfigs').mode : false,
		isSiteId = !!(site.get('siteId')),
		siteId = isSiteId ? site.get('siteId') : false,
		siteName = site.get('siteName'),
		siteDomain = site.get('siteDomain'),

		siteData = {
			id: siteId,
			mode: siteMode,
			name: siteName,
			domain: siteDomain
		},

		oneDayBeforeDate = moment().subtract(1, 'days').format(DATE.FORMAT['y-m-d']),
		twoDaysBeforeDate = moment().subtract(2, 'days').format(DATE.FORMAT['y-m-d']),

		getOneDayBeforeReport = universalReportService.getReportData(site, oneDayBeforeDate, oneDayBeforeDate),
		getTwoDaysBeforeReport = universalReportService.getReportData(site, twoDaysBeforeDate, twoDaysBeforeDate);

		return Promise.join(getOneDayBeforeReport, getTwoDaysBeforeReport, (oneDayBeforeReport, twoDaysBeforeReport) => {
			return validateReportData(oneDayBeforeReport, twoDaysBeforeReport, siteData)
				.then(generateMailContent)
				.then(resolve);
		});
}


module.exports = {
	init: (site) => {
		return new Promise(initModule.bind(null, site));
	}
};
