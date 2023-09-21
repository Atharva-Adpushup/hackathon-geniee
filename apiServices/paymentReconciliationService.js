/* eslint-disable consistent-return */
const { appBucket } = require('../helpers/routeHelpers');
const { couchBase } = require('../configs/config');

const { fetchReports } = require('./reportsService');
const { getMonthStartDate, getMonthEndDate } = require('../helpers/commonFunctions');
const { ADPUSHUP_NETWORK_ID, REVENUE_CHANNEL } = require('../configs/commonConsts');

const getAllActiveMgDeals = (reportConfig = {}) => {
	const { month, year } = reportConfig;
	const query = `
		SELECT mgDealDocs.siteId, dealValue.mgValue, mgDealDocs.mgType from 
			(SELECT mgDeal.dealValues, mgDeal.siteId, mgDeal.mgType FROM ${couchBase.DEFAULT_BUCKET} doc 
				UNNEST doc.mgDeals as mgDeal 
				where meta(doc).id like 'mgdl::%' and mgDeal.dealValues is valued and mgDeal.isActive = true
			) as mgDealDocs 
			UNNEST mgDealDocs.dealValues as dealValue where dealValue.month = ${Number(
				month
			)} and dealValue.year = ${Number(year)};`;

	return appBucket.queryDB(query);
};

const getAllSitesData = (reportingConfig = {}) => {
	const { toDate, fromDate, siteid = '', dimension, revenueChannel } = reportingConfig;

	// Set Global Site Level Revenue Data Config
	const globalReportConfig = {
		fromDate,
		toDate,
		interval: 'cumulative',
		dimension,
		isSuperUser: 'true',
		siteid
	};
	if (revenueChannel) {
		globalReportConfig.revenue_channel = revenueChannel;
	}

	return fetchReports(globalReportConfig);
};

const getNonApGamSites = async () =>
	new Promise(async (resolve, reject) => {
		try {
			const query = `SELECT site.siteId FROM ${couchBase.DEFAULT_BUCKET} doc UNNEST doc.sites as site 
			where meta(doc).id like 'user::%' 
			and doc.adServerSettings.dfp is valued 
			and doc.adServerSettings.dfp.activeDFPNetwork != '${ADPUSHUP_NETWORK_ID}'`;

			const siteList = await appBucket.queryDB(query);
			return resolve(siteList.map(d => d.siteId));
		} catch (e) {
			return reject(e);
		}
	});

const combineSiteWiseDataCallback = (acc, currentData) => {
	const {
		siteid: siteId,
		network_gross_revenue: grossRevenue = 0,
		network_net_revenue: netRevenue = 0,
		network_impressions: impressions = 0,
		adpushup_page_views: pageViews = 0,
		unique_impressions: uniqueImpressions = 0
	} = currentData;
	if (!acc[siteId]) {
		acc[siteId] = {
			grossRevenue: 0,
			netRevenue: 0,
			pageViews: 0,
			impressions: 0,
			uniqueImpressions: 0
		};
	}
	acc[siteId].grossRevenue += grossRevenue;
	acc[siteId].netRevenue += netRevenue;
	acc[siteId].impressions += impressions;
	acc[siteId].pageViews += pageViews;
	acc[siteId].uniqueImpressions += uniqueImpressions;
	return acc;
};

const getNonApGamAdXRevenue = async initialConfig =>
	new Promise(async (resolve, reject) => {
		try {
			const nonApGamSites = await getNonApGamSites();

			const config = {
				...initialConfig,
				siteid: nonApGamSites.join(),
				revenueChannel: [
					REVENUE_CHANNEL.DYNAMIC_ALLOCATION,
					REVENUE_CHANNEL.EXCHANGE_BIDDING
				].join(),
				dimension: 'siteid'
			};

			const allSitesData = await getAllSitesData(config);

			return resolve(allSitesData.result.reduce(combineSiteWiseDataCallback, {}));
		} catch (e) {
			return reject(e);
		}
	});

const getOnlyApRevenueShare = ({
	siteWiseCombinedRevenueData,
	nonApGamAdXRevenue,
	siteWiseTagWiseRevenueData,
	siteWiseHbDirectRevenueData
}) => {
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for (const siteId in siteWiseCombinedRevenueData) {
		const completeRevenueSiteObj = siteWiseCombinedRevenueData[siteId];
		const nonApGamAdXSiteObj = nonApGamAdXRevenue[siteId];
		const siteWiseTagWiseRevenueObj = siteWiseTagWiseRevenueData[siteId];
		const siteWiseHbDirectRevenueObj = siteWiseHbDirectRevenueData[siteId];

		// Remove Other GAM ADX Revenue
		if (nonApGamAdXSiteObj && nonApGamAdXSiteObj.revenue) {
			completeRevenueSiteObj.netRevenue -= nonApGamAdXSiteObj.netRevenue;
			completeRevenueSiteObj.grossRevenue -= nonApGamAdXSiteObj.grossRevenue;
		}

		// Remove TAG based data
		if (siteWiseTagWiseRevenueObj && siteWiseTagWiseRevenueObj.revenue) {
			completeRevenueSiteObj.netRevenue -= siteWiseTagWiseRevenueObj.netRevenue;
			completeRevenueSiteObj.grossRevenue -= siteWiseTagWiseRevenueObj.grossRevenue;
			completeRevenueSiteObj.tagBasedRevenue = siteWiseTagWiseRevenueObj.grossRevenue;
		}

		// Remove HB Direct Revenue
		if (siteWiseHbDirectRevenueObj && siteWiseHbDirectRevenueObj.revenue) {
			completeRevenueSiteObj.grossRevenue -= siteWiseHbDirectRevenueObj.grossRevenue;
			completeRevenueSiteObj.netRevenue -= siteWiseHbDirectRevenueObj.netRevenue;
		}
	}
	return siteWiseCombinedRevenueData;
};

const getCombinedSiteLevelRevenueData = async initialConfig =>
	new Promise(async (resolve, reject) => {
		try {
			const config = {
				...initialConfig,
				dimension: 'siteid'
			};
			const siteReportingData = await getAllSitesData(config);
			const combinedSiteWiseData = siteReportingData.result.reduce(combineSiteWiseDataCallback, {});
			return resolve(combinedSiteWiseData);
		} catch (e) {
			return reject(e);
		}
	});

const getAllRevenueChannelWiseData = async initialConfig =>
	new Promise(async (resolve, reject) => {
		try {
			const config = {
				...initialConfig,
				dimension: 'siteid',
				revenueChannel: [REVENUE_CHANNEL.TAB_BASED].join()
			};
			const siteReportingData = await getAllSitesData(config);
			const combinedSiteWiseData = siteReportingData.result.reduce(combineSiteWiseDataCallback, {});

			return resolve(combinedSiteWiseData);
		} catch (e) {
			return reject(e);
		}
	});

const getAllHBDirectSiteWiseRevenueData = async initialConfig =>
	new Promise(async (resolve, reject) => {
		try {
			const config = {
				...initialConfig,
				dimension: 'siteid',
				revenueChannel: [REVENUE_CHANNEL.HEADER_BIDDING_DIRECT].join()
			};
			const siteReportingData = await getAllSitesData(config);
			const combinedSiteWiseData = siteReportingData.result.reduce(combineSiteWiseDataCallback, {});
			return resolve(combinedSiteWiseData);
		} catch (e) {
			return reject(e);
		}
	});

const getSiteWiseGlobalReportingData = async reportConfig =>
	new Promise((resolve, reject) => {
		try {
			const { date } = reportConfig;
			const monthStartDate = getMonthStartDate(date);
			const monthEndDate = getMonthEndDate(date);

			const initialConfig = { fromDate: monthStartDate, toDate: monthEndDate };

			/**
			 * Get all site data
			 * Subtract AdX data for accounts where Ad Manager is not Adpushup
			 */
			const siteWiseCombinedRevenueDataPromise = getCombinedSiteLevelRevenueData(initialConfig);
			const siteWiseTagWiseRevenueDataPromise = getAllRevenueChannelWiseData(initialConfig);
			const nonApGamAdXRevenuePromise = getNonApGamAdXRevenue(initialConfig);
			const siteWiseHbDirectRevenueDataPromise = getAllHBDirectSiteWiseRevenueData(initialConfig);

			const consoleRevenueDataPromise = [
				siteWiseCombinedRevenueDataPromise,
				siteWiseTagWiseRevenueDataPromise,
				nonApGamAdXRevenuePromise,
				siteWiseHbDirectRevenueDataPromise
			];

			Promise.all(consoleRevenueDataPromise)
				.then(consoleRevenueData => {
					const [
						siteWiseCombinedRevenueData,
						siteWiseTagWiseRevenueData,
						nonApGamAdXRevenue,
						siteWiseHbDirectRevenueData
					] = consoleRevenueData;

					const siteWiseApRevenue = getOnlyApRevenueShare({
						siteWiseCombinedRevenueData,
						nonApGamAdXRevenue,
						siteWiseTagWiseRevenueData,
						siteWiseHbDirectRevenueData
					});

					return resolve(siteWiseApRevenue);
				})
				.catch(e => reject(e));
		} catch (e) {
			return reject(e);
		}
	});

const paymentReconciliationUtils = {
	generateDiscrepancyReport: async config =>
		new Promise((resolve, reject) => {
			try {
				const { reportConfig } = config;
				const siteWiseRevenueDataPromise = getSiteWiseGlobalReportingData(reportConfig);
				const siteWiseMgDealsPromise = getAllActiveMgDeals(reportConfig);

				const promises = [siteWiseRevenueDataPromise, siteWiseMgDealsPromise];

				Promise.allSettled(promises)
					.then(promiseValues => promiseValues.map(promise => promise.value))
					.then(discrepancyData => {
						const [siteWiseRevenueData, mgDeals = []] = discrepancyData;

						return resolve({ siteWiseRevenueData, mgDeals });
					})
					.catch(e => {
						throw new Error(e);
					});
			} catch (error) {
				return reject(error);
			}
		})
};
module.exports = paymentReconciliationUtils;
