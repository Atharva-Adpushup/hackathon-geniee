const axios = require('axios').default;
const fs = require('fs');
const moment = require('moment');

const hbModel = require('./../../../models/headerBiddingModel');
const config = require('../../../configs/config');
const { sendEmail } = require('../../../helpers/queueMailer');

const cron = require('node-cron');

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
		url: 'https://api.adpushup.com/CentralReportingWebService/site/list',
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
		url: 'https://api.adpushup.com/CentralReportingWebService/site/list',
		params: {
			list_name: 'GET_ALL_DEVICES',
			isSuperUser: true
		}
	});

	return extractDataFromResponse(response);
}

async function getRuleData(startdate, enddate, bidders, country, device_type, siteid) {
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/report',
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('yyyy-MM-DD'),
			toDate: enddate.format('yyyy-MM-DD'),
			interval: 'cumulative',
			refresh_count: 0,
			network: bidders,
			country,
			siteid,
			device_type
		}
	});

	return extractDataFromResponse(response);
}

async function fetchHbAnalyticsData(startdate, enddate) {
	const response = await axios({
		method: 'GET',
		url: 'https://api.adpushup.com/CentralReportingWebService/hb_analytics/report',
		params: {
			report_name: 'GET_UI_PANEL_REPORT',
			isSuperUser: true,
			fromDate: startdate.format('yyyy-MM-DD'),
			toDate: enddate.format('yyyy-MM-DD'),
			dimension: 'siteid,network,country,device_type',
			siteid: SITES_TO_PROCESS.join(','),
			refresh_count: 0,
			interval: 'cumulative'
		}
	});

	return extractDataFromResponse(response);
}
function mapToKVPair(data = []) {
	return data.reduce((result, elem) => ({ ...result, [elem.id]: elem }), {});
}

async function fetchMeta() {
	const countryResponse = await axios.get(
		'https://api.adpushup.com/CentralReportingWebService/site/list?list_name=GET_ALL_COUNTRIES'
	);
	const networks = await hbModel.getAllBiddersFromNetworkConfig();

	const countries = extractDataFromResponse(countryResponse);
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
	console.error(body)
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
		const analyticsData = await fetchHbAnalyticsData(oneWeekAgo, today);
		const meta = await fetchMeta();

		//get total HB revenue
		const siteCombinationWiseTotalRevenue = analyticsData.reduce((result, item) => {
			var key = `${item.cid}-${item.device_type}`;
			result[item.siteid] = result[item.siteid] || {};
			result[item.siteid][key] =
				(result[item.siteid][key] || 0) + Number(item.overall_gross_revenue);
			return result;
		}, {});

		const totalSiteWiseRevenue = analyticsData.reduce((result, item) => {
			const { siteid, overall_gross_revenue } = item;
			result[siteid] = (result[siteid] || 0) + overall_gross_revenue;
			return result;
		}, {});

		//get site wise object comtaining array of country-device-bidder revenue share
		const countryDeviceWiseBidderData = analyticsData.reduce((result, data) => {
			const {
				siteid,
				network,
				cid,
				device_type,
				overall_gross_revenue,
				average_response_time,
				prebid_timeouts_percentage
			} = data;
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
					average_response_time,
					prebid_timeouts_percentage,
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
				var sortedRevenue = revenueData.sort((a, b) => a.revShare - b.revShare);
				var totalRev = 100;
				for (let i = 0; i < sortedRevenue.length; i++) {
					var deviceEntry = sortedRevenue[i];
					totalRev -= deviceEntry.revShare;
					if (totalRev <= 99) {
						break;
					}
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
				const bidderObj = meta.networks.filter(network =>
					network.name.toUpperCase().includes(
						bidder
							.split('(HB)')
							.join('')
							.split('(EB)')
							.join('')
							.trim()
							.toUpperCase()
					)
				)[0];
				if (!bidderObj) {
					// HANDLE EDGE CASE
					sendErrorEmail(`Network Meta not found for ${bidder}`, 'Network meta not found error');
					console.log(`Network Meta not found for ${bidder}`);
					continue;
				}

				for (const [device, countries] of Object.entries(bidderRules)) {
					const countryIds = countries.map(id => meta.countries[id].country_code_alpha2);
					
					const deviceKey = DEVICE_MAPPING[device];
					

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

			try {
				const siteHbConfig = await hbModel.getHbConfig(site);
				const existingAutoRules = siteHbConfig.get('autoRules') || [];
				fs.writeFileSync(`${site}rulesbackup.json`, JSON.stringify(existingAutoRules))
				siteHbConfig.set('autoRules', [...existingAutoRules, ...rulesArray]);
				siteHbConfig.save();

				const updatedHbConfig=await hbModel.getHbConfig(site);
				var totalBlockedRevenueFromRule=0;
				var updatedAutoRules=updatedHbConfig.get('autoRules').filter(rule=>rule.description=='Auto Bidder Blocking Rules');
				for (var i=0; i<updatedAutoRules.length; i++) {
					var currentRule=updatedAutoRules[i];
					var bidder=currentRule.actions[0].value[0];
					var bidderName=meta.networks.find(network=>network.ntkey==bidder).name;
					var countries=currentRule.triggers.filter(trigger=>trigger.key=='country')[0].value;
					var deviceType=currentRule.triggers.filter(trigger=>trigger.key=='device')[0].value[0];


					var countryReportKeys = countries.map(id => {
						return Object.values(meta.countries).filter(countryObj=>countryObj.country_code_alpha2 ===id)[0].id;
					});
					const deviceId = meta.deviceKeys.filter(deviceObj => deviceObj.ext == deviceType)[0];
					const networkKey = meta.networkReportKeys.filter(network =>
						network.value.toUpperCase().includes(bidderName.toUpperCase())
					)[0];
					if(!networkKey){
						continue;
					}
					

					var blockedRevenue = await getRuleData(
						oneWeekAgo,
						today,
						networkKey.id,
						countryReportKeys.join(','),
						deviceId.id,
						site
					);
					totalBlockedRevenueFromRule += blockedRevenue[0] ? blockedRevenue[0].overall_gross_revenue : 0;
				}

				const isRuleCorrect =
				Math.round(totalBlockedRevenueFromRule  * 100 / totalSiteWiseRevenue[site]) < 1;
				if(!isRuleCorrect){
					sendErrorEmail(`Incorrect Rule pushed to site ${site}`,'Incorrect CB update')
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
