const axios = require('axios').default;
const fs = require('fs');
const moment = require('moment');

const hbModel = require('./../../../models/headerBiddingModel');
const config = require('../../../configs/config');
const { sendEmail } = require('../../../helpers/queueMailer');

const cron = require('node-cron');

const REPORTING_APIS = {
	LIST: 'https://api.adpushup.com/CentralReportingWebService/site/list',
	HB_REPORT: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/report',
	CENTRAL_REPORT: 'https://api.adpushup.com/CentralReportingWebService/site/report'
};

const DEVICE_MAPPING = {
	'Desktop/PC': 'desktop',
	'Mobile/Phone': 'mobile',
	Tablet: 'tablet'
};

const SITES_TO_PROCESS = config.autoBidderBlockEnabledSites || [];

function extractDataFromResponse(response) {
	if (response.status != 200 || !response.data) {
		return;
	}

	const { data: dataObj } = response.data || {};

	const data = dataObj.result || [];

	return data;
}

async function getNetworkKeys() {
	const response = await axios({
		method: 'GET',
		url: REPORTING_APIS.LIST,
		params: {
			list_name: 'GET_ALL_NETWORKS',
			isSuperUser: true,
			revenue_channel: '2,5'
		}
	});

	return extractDataFromResponse(response);
}

async function getDeviceKeys() {
	const response = await axios({
		method: 'GET',
		url: REPORTING_APIS.LIST,
		params: {
			list_name: 'GET_ALL_DEVICES',
			isSuperUser: true
		}
	});

	return extractDataFromResponse(response);
}

async function getCountryKeys() {
	const response = await axios({
		method: 'GET',
		url: REPORTING_APIS.LIST,
		params: {
			list_name: 'GET_ALL_COUNTRIES',
			isSuperUser: true
		}
	});

	return extractDataFromResponse(response);
}

async function getHBRuleData(startdate, enddate, bidders, country, device_type, siteid) {
	const response = await axios({
		method: 'GET',
		url: REPORTING_APIS.HB_REPORT,
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			interval: 'cumulative',
			network: bidders,
			country,
			siteid,
			device_type
		}
	});

	return extractDataFromResponse(response);
}

async function getUAMRuleData(startdate, enddate, country, device_type, siteid) {
	const response = await axios({
		method: 'GET',
		url: REPORTING_APIS.CENTRAL_REPORT,
		params: {
			report_name: 'get_stats_by_custom',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			siteid: SITES_TO_PROCESS.join(','),
			network: 56,
			interval: 'cumulative',
			country,
			device_type,
			siteid
		}
	});

	return extractDataFromResponse(response);
}

async function fetchUAMData(startdate, enddate) {
	const response = await axios({
		method: 'GET',
		url: REPORTING_APIS.CENTRAL_REPORT,
		params: {
			report_name: 'get_stats_by_custom',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			dimension: 'siteid,country,device_type',
			siteid: SITES_TO_PROCESS.join(','),
			network: 56,
			interval: 'cumulative'
		}
	});

	return extractDataFromResponse(response);
}

async function fetchHbAnalyticsData(startdate, enddate) {
	const response = await axios({
		method: 'GET',
		url: REPORTING_APIS.HB_REPORT,
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('YYYY-MM-DD'),
			toDate: enddate.format('YYYY-MM-DD'),
			dimension: 'siteid,network,country,device_type',
			siteid: SITES_TO_PROCESS.join(','),
			interval: 'cumulative'
		}
	});

	return extractDataFromResponse(response);
}
function mapToKVPair(data = []) {
	return data.reduce((result, elem) => ({ ...result, [elem.id]: elem }), {});
}

async function fetchMeta() {
	const networks = await hbModel.getAllBiddersFromNetworkConfig();

	const countries = await getCountryKeys();
	const deviceKeys = await getDeviceKeys();
	const networkReportKeys = await getNetworkKeys();

	return {
		countries: mapToKVPair(countries),
		networks: Object.keys(networks).map(ntkey => ({ ntkey, ...networks[ntkey] })),
		deviceKeys,
		networkReportKeys
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

async function bidderBlocking() {
	try {
		const today = moment().subtract(2, 'days');
		const oneWeekAgo = today.clone().subtract(30, 'days');

		// Fetching required data for rule generation
		const hbAnalyticsData = await fetchHbAnalyticsData(oneWeekAgo, today);
		const uamData = await fetchUAMData(oneWeekAgo, today);

		//maintain uniform key for revenue
		const keyAddedUAMData = uamData.map(item => {
			return {
				...item,
				overall_gross_revenue: item.network_gross_revenue,
				network: 'AmazonUAM',
				ntwid: 56
			};
		});

		//combine uam and hb data arrays
		const analyticsData = hbAnalyticsData.concat(keyAddedUAMData);
		const meta = await fetchMeta();

		//get total HB (device-country) wise revenue
		const siteCombinationWiseTotalRevenue = analyticsData.reduce((result, item) => {
			const { siteid, overall_gross_revenue, cid, device_type } = item;
			var key = `${cid}-${device_type}`;
			result[siteid] = result[siteid] || {};
			result[siteid][key] = (result[siteid][key] || 0) + Number(overall_gross_revenue);
			return result;
		}, {});

		//get total site wise HB revenue
		const totalSiteWiseRevenue = analyticsData.reduce((result, item) => {
			const { siteid, overall_gross_revenue } = item;
			result[siteid] = (result[siteid] || 0) + overall_gross_revenue;
			return result;
		}, {});

		//get site wise object comtaining arrays of country-device bidder revenue share
		const countryDeviceWiseBidderData = analyticsData.reduce((result, data) => {
			const { siteid, network, cid, device_type, overall_gross_revenue } = data;
			const key = `${cid}-${device_type}`;
			const revShare = (
				(overall_gross_revenue / siteCombinationWiseTotalRevenue[siteid][key]) *
				100
			).toFixed(3);

			result[siteid] = result[siteid] || {};
			result[siteid][key] = [
				...(result[siteid][key] || []),
				{
					revShare,
					network,
					cid,
					device_type
				}
			];

			return result;
		}, {});

		for (var [site, siteData] of Object.entries(countryDeviceWiseBidderData)) {
			var blockingData = [];

			for (var [key, revenueData] of Object.entries(siteData)) {
				//sort in descending order of revenue
				var sortedRevenue = revenueData.sort((a, b) => a.revShare - b.revShare);
				var totalRev = 100;
				for (let i = 0; i < sortedRevenue.length; i++) {
					var deviceEntry = sortedRevenue[i];
					totalRev -= deviceEntry.revShare;
					if (totalRev <= 99) {
						break;
					}
					//add bidder to blocking array till 99% revenue is reached
					blockingData.push({
						network: deviceEntry.network,
						device: deviceEntry.device_type,
						cid: deviceEntry.cid
					});
				}
			}
			//cumulate rules bidder wise
			var bidderBlockRules = blockingData.reduce((result, item) => {
				result[item.network] = result[item.network] || {};
				result[item.network][item.device] = [
					...(result[item.network][item.device] || []),
					item.cid
				];
				return result;
			}, {});
			console.log(`Generating rules for site ${site}`);
			const rulesArray = [];

			//generating rule array
			for (const [bidder, bidderRules] of Object.entries(bidderBlockRules)) {
				var bidderObj = bidder;
				if (bidderObj !== 'AmazonUAM') {
					bidderObj = meta.networks.find(network =>
						network.name.toUpperCase().includes(
							bidder
								.replace(/(\(EB\))|(\(HB\))/g, '')
								.trim()
								.toUpperCase()
						)
					);
					if (!bidderObj) {
						// HANDLE EDGE CASE
						sendErrorEmail(`Network Meta not found for ${bidder}`, 'Network meta not found error');
						console.log(`Network Meta not found for ${bidder}`);
						continue;
					}
				}

				for (const [device, countries] of Object.entries(bidderRules)) {
					const countryIds = countries.map(id => meta.countries[id].country_code_alpha2);

					const deviceKey = DEVICE_MAPPING[device];
					if (bidderObj == 'AmazonUAM') {
						rulesArray.push({
							actions: [{ key: 'amazon_block', value: 'Block AmazonUAM' }],
							description: 'Auto Bidder Blocking Rules',
							isActive: true,
							triggers: [
								{ key: 'country', operator: 'contain', value: countryIds },
								{ key: 'device', operator: 'contain', value: [deviceKey] }
							],
							isAuto: true
						});
					} else {
						rulesArray.push({
							actions: [{ key: 'disallowed_bidders', value: [bidderObj.ntkey] }],
							description: 'Auto Bidder Blocking Rules',
							isActive: true,
							triggers: [
								{ key: 'country', operator: 'contain', value: countryIds },
								{ key: 'device', operator: 'contain', value: [deviceKey] }
							],
							isAuto: true
						});
					}
				}
			}

			try {
				const siteHbConfig = await hbModel.getHbConfig(site);
				const existingAutoRules = siteHbConfig.get('autoRules') || [];
				fs.writeFileSync(`${site}rulesbackup.json`, JSON.stringify(existingAutoRules));
				siteHbConfig.set('autoRules', [...existingAutoRules, ...rulesArray]);
				siteHbConfig.save();

				const updatedHbConfig = await hbModel.getHbConfig(site);
				var totalBlockedRevenueFromRule = 0;
				var updatedAutoRules = updatedHbConfig
					.get('autoRules')
					.filter(rule => rule.description == 'Auto Bidder Blocking Rules');

				//validate rules created
				for (var i = 0; i < updatedAutoRules.length; i++) {
					var currentRule = updatedAutoRules[i];
					if (!currentRule || !currentRule.actions || !currentRule.actions.length) {
						continue;
					}

					var countries = currentRule.triggers.find(trigger => trigger.key == 'country');
					if (!countries || !countries.value) {
						continue;
					}
					countries = countries.value;
					var deviceType = currentRule.triggers.find(trigger => trigger.key == 'device');
					if (!deviceType || !deviceType.value) {
						continue;
					}
					deviceType = deviceType.value[0];

					var countryReportKeys = countries
						.map(id => {
							var matchedCountry = Object.values(meta.countries).filter(
								countryObj => countryObj.country_code_alpha2 === id
							);
							matchedCountry = matchedCountry.length && matchedCountry[0];
							return matchedCountry.id;
						})
						.filter(Number);

					if (!countryReportKeys || !countryReportKeys.length) {
						continue;
					}
					const deviceId = meta.deviceKeys.find(deviceObj => deviceObj.ext == deviceType);
					if (!deviceId) {
						continue;
					}
					let currentRuleAction = currentRule.actions[0];
					if (currentRuleAction.key == 'disallowed_bidders') {
						var ruleBidderObj = currentRuleAction.value;
						if (!ruleBidderObj) {
							continue;
						}
						var bidder = ruleBidderObj[0];
						if (!bidder) {
							continue;
						}
						var bidderName = meta.networks.find(network => network.ntkey == bidder).name;
						const networkKey = meta.networkReportKeys.find(network =>
							network.value.toUpperCase().includes(bidderName.toUpperCase())
						);
						if (!networkKey) {
							continue;
						}

						var blockedRevenue = await getHBRuleData(
							oneWeekAgo,
							today,
							networkKey.id,
							countryReportKeys.join(','),
							deviceId.id,
							site
						);
						totalBlockedRevenueFromRule += blockedRevenue[0]
							? blockedRevenue[0].overall_gross_revenue
							: 0;
					} else if (currentRuleAction.key == 'amazon_block') {
						var blockedRevenue = await getUAMRuleData(
							oneWeekAgo,
							today,
							countryReportKeys.join(','),
							deviceId.id,
							site
						);
						totalBlockedRevenueFromRule += blockedRevenue[0]
							? blockedRevenue[0].network_gross_revenue
							: 0;
					}
				}

				const isRuleCorrect = (totalBlockedRevenueFromRule * 100) / totalSiteWiseRevenue[site] < 1;
				if (!isRuleCorrect) {
					sendErrorEmail(`Incorrect Rule pushed to site ${site}`, 'Incorrect CB update');
				}

				console.log(`Rules generated succesfully for ${site}`);
			} catch (e) {
				console.log(`-------ERROR IN SETTING SITE CONFIG FOR ${site}`);
				sendErrorEmail(e.stack, `Error in setting site config for ${site} auto bidder blocking`);
			}
		}
	} catch (e) {
		console.log(`---------- ERROR ---------`);
		sendErrorEmail(e.stack, 'Error in Auto Bidder Blocking Cron');
		console.error(e);
	}
}

bidderBlocking();
//cron.schedule(config.autoBlockCronSchedule, bidderBlocking);
