const axios = require('axios');
const { Promise } = require('bluebird');
const rp = require('request-promise');
const cron = require('node-cron');
const { promiseForeach } = require('node-utils');

const { appBucket } = require('../../../helpers/routeHelpers');
const siteModel = require('../../../models/siteModel');
const config = require('../../../configs/config');
const constants = require('../../../configs/commonConsts');

const TOKEN = 'D152A218-5DE9-4834-91F0-95542119D520';
const API_ENDPOINT = `https://pmc.criteo.com/api/stats?apitoken=${TOKEN}`;
const queryParams = {
	dimensions: 'domain',
	generator: 'daily',
	currency: 'USD',
    metrics: 'Revenue,CriteoDisplays',
    begindate: '2021-01-07',
    enddate: '2021-01-07'
};

const reportingBaseURL = 'https://api.adpushup.com/CentralReportingWebService';
const REPORT_PATH = '/site/report?report_name=get_stats_by_custom';
const ANALYTICS_API_ROOT = 'https://console.adpushup.com';

/**
 * Pub API
 * 1. Get Token If not
 * 2. Check Token validity if exist
 * 3. Get clientId, secret - If needed
 * 4. Fetch data
 * 5. Process Data if needed
 * 6. Return result
 *
 * AdPushup
 * 1. Super User access
 * 2. API endpoint
 * 3. Fetch data
 *
 * Comparison
 * 1. Process both the data if needed
 * 2. compare data
 * 3. Check for anomaly
 * 4. Report anomaly
 *
 * Notes:
 * Some tokens are valid for long time - can be used as constant in config
 * Some may need to refresh after certain time - got expired after some time
 * Some may need to fetch fresh token for every req
 */

function getDataFromAdPushup(siteId) {
	return axios
		.get(`${reportingBaseURL}${REPORT_PATH}`, {
			params: {
                siteid:siteId,
                network: 20,
                fromDate:"2021-01-07",
                toDate:"2021-01-07",
                interval:"daily",
                // siteid:40792,
                dimension:"siteid"
            }
        })
        .then(response => response.data)
        .then(({ data: {result: adpData}}) => {
            return adpData.map(item => {
                const {
                    siteid, network_gross_revenue, site
                } = item;
                return {
                    siteid,
                    network_gross_revenue,
                    site
                }
            })
        })
        .catch(e => {
			console.log(`error in getting ADP data:${e}`);
			throw { error: true };
			// return err;
		});

	// return siteListPromise;
}

const fetchData = async (sitesData) => {
	console.log('Fetching data from Criteo...');
	// Make a request for a user with a given ID
	return axios
		.get(API_ENDPOINT, {
			params: queryParams
		})
		.then(response => response.data)
		.then(async function(data) {
            // let zouton = data.filter(item => item.Domain == "zouton.com")
            // console.log(zouton, 'zouton.com')
            // console.log('Fetching data from AdPushup...');

            // console.log(sitesData, sitesData.length, 'sitesData')
            console.log('processing sitesData....')
            // let arr = sitesData.map(item => item.siteId);
            // console.log(arr.join(), 'arr')

            // process and map sites data with publishers API data structure
            const sitesDomainAndIdMapping = {};
            const sitesIdAndDomainMapping = {};
            sitesData.map(item => {
                const domain = item.siteDomain
                    .replace(/(^\w+:|^)\/\//, '')
                    .replace(/^https?:\/\//,'')
                    .replace(/^w+./, '')
                    .replace(/^hw+./, '')
                    .replace(/\/$/, "");
                sitesDomainAndIdMapping[domain] = item;
                sitesIdAndDomainMapping[item.siteId] = item;
                sitesIdAndDomainMapping[item.siteId].domain = domain;
                return item;
            });
            // console.log(siteIdArr, siteIdArr.length, 'siteIdArr')
            // console.log(sitesDomainAndIdMapping, 'sitesDomainAndIdMapping')
            // console.log(sitesIdAndDomainMapping, 'sitesIdAndDomainMapping')
            let siteIdArr = [];
            let _data = data.map(item => {
                const details = sitesDomainAndIdMapping[item.Domain];
                // console.log(details, item.Domain, item)
                item.details = details;
                return item;
            })
            .filter((item) => !!item.details)
            .map(item => {
                sitesDomainAndIdMapping[item.Domain].pubRevenue = item.Revenue
                siteIdArr.push(item.details.siteId)
                return item;
            })
            // console.log(_data, '_data')
            // console.log(siteIdArr.join(), siteIdArr.length, 'siteIdArr')

            const adpData = await getDataFromAdPushup(siteIdArr.join(','));
            let finalData = [];
            adpData.map((item) => {
                // console.log(sitesIdAndDomainMapping[item.siteid], 'sitesIdAndDomainMapping[item.siteid]')
                let siteDetail = sitesIdAndDomainMapping[item.siteid]
                // console.log(siteDetail, 'siteDetail', item.siteid)
                sitesDomainAndIdMapping[siteDetail.domain].adpRevenue = item.network_gross_revenue
                sitesDomainAndIdMapping[siteDetail.domain].diff = sitesDomainAndIdMapping[siteDetail.domain].pubRevenue - item.network_gross_revenue
                sitesDomainAndIdMapping[siteDetail.domain].diffPer = (sitesDomainAndIdMapping[siteDetail.domain].diff/sitesDomainAndIdMapping[siteDetail.domain].pubRevenue) * 100
                // console.log(sitesDomainAndIdMapping[sitesIdAndDomainMapping[item.siteid].domain])
                finalData.push(sitesDomainAndIdMapping[sitesIdAndDomainMapping[item.siteid].domain])
                // console.log(item.network_gross_revenue, 'item.network_gross_revenue' ,sitesDomainAndIdMapping[siteDetail.domain].pubRevenue, sitesDomainAndIdMapping[siteDetail.domain])
            })

            console.log(JSON.stringify(finalData, null, 3), 'finalData')
            // console.log(sitesDomainAndIdMapping)

		})
		.catch(function(error) {
			// handle error
			console.log(error), 'errrr';
		})
		.then(function() {
			// always executed
		});
};

module.exports = fetchData;
