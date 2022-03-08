const axios = require('axios').default;
const moment = require('moment');
const fs = require('fs');

const hbModel = require('../../../models/headerBiddingModel');
const config = require('../../../configs/config');
const { sendEmail } = require('../../../helpers/queueMailer');

const cron = require('node-cron');

const DEVICE_MAPPING = {
	'Desktop/PC': 'desktop',
	'Mobile/Phone': 'mobile',
	Tablet: 'tablet'
};

const SITES_TO_PROCESS = config.timeoutOptimisationEnabledSites || [];

const responseBuckets = [
	{ key: 'Old Bid', max: 11000 },
	{ key: 'More than 5000ms', max: 10000 },
	{ key: '4000ms-5000ms', max: 5000 },
	{ key: '3000ms-4000ms', max: 4000 },
	{ key: '2000ms-3000ms', max: 3000 },
	{ key: '1500ms-2000ms', max: 2000 },
	{ key: '1000ms-1500ms', max: 1500 },
	{ key: '500ms-1000ms', max: 1000 },
	{ key: '200ms-500ms', max: 500 },
	{ key: '100ms-200ms', max: 200 },
	{ key: '0-100ms', max: 100 }
];

function extractDataFromResponse(response) {
	if (response.status != 200 || !response.data) {
		return;
	}

	const { data: dataObj } = response.data || {};

	const data = dataObj.result || [];

	return data;
}

async function getBucketKeys() {
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/list',
		params: {
			list_name: 'GET_BID_RESPONSE_BUCKETS',
			isSuperUser: true
		}
	});

	return extractDataFromResponse(response);
}
async function getDeviceKeys() {
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/site/list',
		params: {
			list_name: 'GET_ALL_DEVICES',
			isSuperUser: true
		}
	});

	return extractDataFromResponse(response);
}

async function getRuleTotalData(
	startdate,
	enddate,
	bid_response_time,
	countries,
	device_type,
	siteid
) {
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/report',
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			dimension: 'bid_response_time',
			interval: 'cumulative',
			country: countries,
			siteid,
			device_type,
			bid_response_time
		}
	});

	return extractDataFromResponse(response);
}

async function getRuleFirstImpData(
	startdate,
	enddate,
	bid_response_time,
	countries,
	device_type,
	siteid
) {
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/report',
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			dimension: 'bid_response_time',
			interval: 'cumulative',
			country: countries,
			refresh_count: 0,
			siteid,
			device_type,
			bid_response_time
		}
	});

	return extractDataFromResponse(response);
}

async function getRuleData(startdate, enddate, bid_response_time, countries, device_type, siteid) {
	var totalData = await getRuleTotalData(
		startdate,
		enddate,
		bid_response_time,
		countries,
		device_type,
		siteid
	);
	var firstImpData = await getRuleFirstImpData(
		startdate,
		enddate,
		bid_response_time,
		countries,
		device_type,
		siteid
	);
	if (
		totalData[0] &&
		totalData[0].overall_gross_revenue &&
		firstImpData[0] &&
		firstImpData[0].overall_gross_revenue
	) {
		totalData[0]['overall_gross_revenue'] -= firstImpData[0]['overall_gross_revenue'];
	}

	return totalData;
}

async function fetchHbAnalyticsTotalData(startdate, enddate) {
	console.log(startdate.format('YYYY-MM-DD'));
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/report',
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			dimension: 'siteid,bid_response_time,country,device_type',
			interval: 'cumulative',
			siteid: SITES_TO_PROCESS.join(',')
		}
	});

	return extractDataFromResponse(response);
}
async function fetchHbAnalyticsFirstImpData(startdate, enddate) {
	console.log(startdate.format('YYYY-MM-DD'));
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/report',
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			dimension: 'siteid,bid_response_time,country,device_type',
			interval: 'cumulative',
			refresh_count: 0,
			siteid: SITES_TO_PROCESS.join(',')
		}
	});

	return extractDataFromResponse(response);
}

async function fetchHbAnalyticsData(startdate, enddate) {
	var totalData = await fetchHbAnalyticsTotalData(startdate, enddate);
	const firstImpData = await fetchHbAnalyticsFirstImpData(startdate, enddate);
	const siteCombinationFirstImpRevenue = firstImpData.reduce((result, item) => {
		const { siteid, overall_gross_revenue, cid, device_type, bid_response_time } = item;
		result[siteid] = result[siteid] || {};
		const key = `${cid}-${device_type}-${bid_response_time}`;
		result[siteid][key] = overall_gross_revenue || 0;
		return result;
	}, {});

	totalData = totalData.map(item => {
		const { siteid, cid, device_type, bid_response_time } = item;
		const key = `${cid}-${device_type}-${bid_response_time}`;
		item.overall_gross_revenue -= siteCombinationFirstImpRevenue[siteid][key] || 0;
		return item;
	});
	return totalData;
}

function mapToKVPair(data = []) {
	return data.reduce((result, elem) => ({ ...result, [elem.id]: elem }), {});
}

async function fetchMeta() {
	const countryResponse = await axios.get(
		'https://api.adpushup.com/CentralReportingWebService/site/list?list_name=GET_ALL_COUNTRIES'
	);
	const networks = await hbModel.getAllBiddersFromNetworkConfig();
	const bucketKeys = await getBucketKeys();

	const countries = extractDataFromResponse(countryResponse);
	const deviceKeys = await getDeviceKeys();

	return {
		countries: mapToKVPair(countries),
		networks: Object.keys(networks).map(ntkey => ({ ntkey, ...networks[ntkey] })),
		bucketKeys,
		deviceKeys
	};
}

function sendErrorEmail(body, subject) {
	sendEmail({
		queue: 'MAILER',
		data: {
			to: config.bidderBlockingSupportMail,
			body: body,
			subject: subject
		}
	});
}

async function timeoutOptimiser() {
	try {
		const today = moment().subtract(2, 'days');
		const oneWeekAgo = today.clone().subtract(30, 'days');

		//Fetching required data for rule generation
		const analyticsData = await fetchHbAnalyticsData(oneWeekAgo, today);
		const meta = await fetchMeta();

		//get total revenue combination (country+device) wise
		const siteCombinationWiseTotalRevenue = analyticsData.reduce((result, item) => {
			const { siteid, overall_gross_revenue, cid, device_type } = item;
			result[siteid] = result[siteid] || {};
			const key = `${cid}-${device_type}`;
			result[siteid][key] = (result[siteid][key] || 0) + Number(overall_gross_revenue);
			return result;
		}, {});
		const totalSiteWiseRevenue = analyticsData.reduce((result, item) => {
			const { siteid, overall_gross_revenue } = item;
			if (!Number.isNaN(overall_gross_revenue)) {
				result[siteid] = (result[siteid] || 0) + Number(overall_gross_revenue);
			}
			return result;
		}, {});

		//group response time buckets according to combination
		const deviceCountryWiseBuckets = analyticsData.reduce((result, item) => {
			const { siteid, overall_gross_revenue, cid, device_type, bid_response_time } = item;
			const key = `${cid}-${device_type}`;
			const revShare = (
				(overall_gross_revenue / siteCombinationWiseTotalRevenue[siteid][key]) *
				100
			).toFixed(3);
			result[siteid] = result[siteid] || {};
			result[siteid][key] = {
				...(result[siteid][key] || {}),
				[bid_response_time]: {
					revShare,
					device_type,
					cid
				}
			};

			return result;
		}, {});

		//generate rules from the combinations of buckets
		for (const [site, siteData] of Object.entries(deviceCountryWiseBuckets)) {
			const finalData = {};
			for (const [countryDeviceKey, keyData] of Object.entries(siteData)) {
				var cid = Object.values(keyData)[0].cid;
				var device_type = Object.values(keyData)[0].device_type;
				var segmentRevenue = siteCombinationWiseTotalRevenue[site][countryDeviceKey] || 0;
				if (segmentRevenue == 0) {
					continue;
				}
				var minRevShare = 100;
				var minTimeout = 0;

				//get min timeout with scope to lose 1% revenue
				for (var i = 0; i < responseBuckets.length; i++) {
					let bucket = responseBuckets[i];
					minRevShare -= keyData[bucket.key] ? keyData[bucket.key].revShare : 0;
					if (minRevShare <= 95.0) {
						minTimeout = bucket.max;

						break;
					}
				}
				if (minTimeout < 3001) {
					finalData[minTimeout] = finalData[minTimeout] || {};
					finalData[minTimeout][device_type] = finalData[minTimeout][device_type] || [];
					finalData[minTimeout][device_type].push(cid);
				}
			}

			const rulesArray = [];

			for (const [timeout, timeoutConfig] of Object.entries(finalData)) {
				for (const [device, deviceConfig] of Object.entries(timeoutConfig)) {
					const countryAlphaCodes = deviceConfig.map(id => meta.countries[id].country_code_alpha2);

					const deviceKey = DEVICE_MAPPING[device];
					rulesArray.push({
						actions: [{ key: 'refresh_timeout', value: timeout }],
						description: 'Refresh Timeout Optimisation rules',
						isActive: true,
						triggers: [
							{ key: 'country', operator: 'contain', value: countryAlphaCodes },
							{ key: 'device', operator: 'contain', value: [deviceKey] }
						],
						isAuto: true
					});
				}
			}

			//generate rules array to be appended to couchbase

			try {
				const siteHbConfig = await hbModel.getHbConfig(site);
				var existingAutoRules = siteHbConfig.get('autoRules') || [];
				fs.writeFileSync(`${site}rulesbackup.json`, JSON.stringify(existingAutoRules));
				if (existingAutoRules.length) {
					existingAutoRules = existingAutoRules.filter(
						rule => rule.description != 'Refresh Timeout Optimisation rules'
					);
				}

				siteHbConfig.set('autoRules', [...existingAutoRules, ...rulesArray]);
				siteHbConfig.save();
				console.log(`Rules set successfully for site ${site}`);

				const updatedSiteHbConfig = await hbModel.getHbConfig(site);
				const updatedTimeoutRules = await updatedSiteHbConfig
					.get('autoRules')
					.filter(rule => rule.description == 'Refresh Timeout Optimisation rules');

				var totalRuleRevenue = 0;
				for (var i = 0; i < updatedTimeoutRules.length; i++) {
					var currentRule = updatedTimeoutRules[i];
					var timeout = currentRule.actions[0].value;
					var countries = currentRule.triggers.filter(trigger => trigger.key == 'country')[0].value;
					var deviceType = currentRule.triggers.filter(trigger => trigger.key == 'device')[0]
						.value[0];

					const countryReportKeys = countries.map(id => {
						return Object.values(meta.countries).filter(
							countryObj => countryObj.country_code_alpha2 === id
						)[0].id;
					});
					const deviceId = meta.deviceKeys.filter(deviceObj => deviceObj.ext == deviceType)[0];
					for (let i = 0; i < responseBuckets.length; i++) {
						if (timeout < responseBuckets[i].max) {
							var timeoutObj = meta.bucketKeys.filter(
								bucket => bucket.value == responseBuckets[i].key
							)[0];
							var revenue = await getRuleData(
								oneWeekAgo,
								today,
								timeoutObj.id,
								countryReportKeys.join(','),
								deviceId.id,
								site
							);
							if (revenue) {
								totalRuleRevenue += revenue[0] ? revenue[0].overall_gross_revenue : 0;
							}
						}
					}
				}
				const isRuleCorrect = Math.round((totalRuleRevenue * 100) / totalSiteWiseRevenue[site]) < 5;
				if (!isRuleCorrect) {
					sendErrorEmail(`rules generated incorrectly for site ${site}`, 'INCORRECT RULE ERROR');
				}
			} catch (e) {
				console.log(`-----ERROR in updating hbdc doc for ${site}`);
				sendErrorEmail(e.stack, `Error in hbdc doc update for ${site} timeout optimisation`);
			}
		}
	} catch (e) {
		console.log('-----------ERROR-----------');
		console.error(e);
		sendErrorEmail(e.stack, 'Error in Timeout Optimization cron');
	}
}

timeoutOptimiser();
//cron.schedule(config.timeoutCronSchedule, timeoutOptimiser);
