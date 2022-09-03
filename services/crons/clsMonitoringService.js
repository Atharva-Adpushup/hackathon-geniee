/*  
- Run the headless automation for the pre-defined site list
- To start with, pick the top 50 sites in the AdPushup book by revenue
- Get the article/category pages using data from the backend (exclude home and pick the other top 5 pages - for any  confusion, reach out to Abhishek Sontakke)
- Use the PerformanceObserver API (or a better alternative if available) to highlight CLS issues
- Trigger for issues - CLS value > 0.1
*/

const request = require('request-promise');
const cron = require('node-cron');

const config = require('../../configs/config');
const couchbase = require('../../helpers/couchBaseService');
const CC = require('../../configs/commonConsts');
const { sendEmail } = require('../../helpers/queueMailer');

//get top sites by revenue from data::topsites
function getTopSites() {
	return couchbase
		.connectToAppBucket()
		.then(appBucket => appBucket.getAsync(CC.docKeys.topSitesByRevenue, {}))
		.then(function(json) {
			return json.value.sites;
		});
}

//get Top 5 urls of each site from the predefined list
function getTopUrlsOfEachSite() {
	return getTopSites().then(sites => {
		return request({
			uri: CC.TOP_URLS_API,
			json: true,
			qs: {
				siteid: sites.join(',')
			}
		}).then(res => res.data.siteUrls); //will be an array
	});
}

function filterUnnecessaryUrls() {
	return getTopUrlsOfEachSite().then(siteUrls =>
		siteUrls.map(siteUrl => {
			return {
				...siteUrl,
				//exclude HOME,NONE and UNDEFINED pagegroups
				urls: siteUrl.urls.filter(
					url =>
						url.pageGroup !== 'HOME' &&
						url.pageGroup !== 'NONE' &&
						url.pageGroup !== 'UNDEFINED' &&
						url.platform !== 'TABLET'
				)
			};
		})
	);
}

function takeTop5UrlsofEachSite() {
	return filterUnnecessaryUrls().then(siteUrls =>
		siteUrls.map(siteUrl => {
			return {
				...siteUrl,
				//take top 5 urls
				urls: siteUrl.urls.sort((a, b) => b.count - a.count).slice(0, 5)
			};
		})
	);
}

function mergeTop5UrlsOfEachSite() {
	return takeTop5UrlsofEachSite().then(sites => {
		const allUrls = sites.map(site =>
			site.urls.map(url => {
				return { ...url, siteId: site.siteId };
			})
		);

		//merge all urls of each site
		return [].concat.apply([], allUrls);
	});
}

// run for each url
function getCoreWebVitalseData(site) {
	return request({
		uri: CC.CORE_WEB_VITALS_API.uri,
		json: true,
		qs: {
			key: CC.CORE_WEB_VITALS_API.key,
			locale: 'en_US',
			url: site.url,
			strategy: site.platform,
			fields: 'loadingExperience'
		},
		headers: CC.CORE_WEB_VITALS_API.headers
	}).then(res => {
		console.log(res);
		if (res && res.loadingExperience) {
			const {
				metrics: { CUMULATIVE_LAYOUT_SHIFT_SCORE: { category, percentile } = {} } = {}
			} = res.loadingExperience;

			if (!category || !percentile) {
				return;
			}

			const clsData = {
				category: category,
				score: percentile / 100
			};

			return {
				url: site.url,
				clsData,
				platform: site.platform,
				siteId: site.siteId
			};
		}
	});
}

function delay() {
	return new Promise(ok => setTimeout(ok, 1000));
}

//because the pagespeed api has q quota limit of 24 requests per minute so implementing rate limiting and batching
async function rateLimitRequests(params) {
	let results = [];

	while (params.length > 0) {
		let batch = [];

		for (let i = 0; i < 4; i++) {
			if (params.length) {
				let thisParam = params.pop();
				if (thisParam) {
					batch.push(getCoreWebVitalseData(thisParam));
				}
			}
		}

		results = results.concat(await Promise.allSettled(batch));

		await delay();
	}

	return results;
}

function calculateCLS() {
	return mergeTop5UrlsOfEachSite().then(sites => {
		return rateLimitRequests(sites);
	});
}

function filterCLSUrlsToSend() {
	return calculateCLS().then(res => {
		//array will be coming as a response from allSettled Promise result
		const filteredResponse = res.filter(data => {
			if (data.status === 'fulfilled' && data.value) {
				return data.value.clsData.category !== 'FAST';
			}
		});
		return filteredResponse;
	});
}

function prepareDataForAlerts() {
	return filterCLSUrlsToSend().then(res => {
		if (!res.length) {
			return;
		}

		const tableFomatData = `<html>
		<body>
		<table>
		  <tr>
			<th>Site Id</th>
			<th>Page Url</th>
			<th>Platform</th>
			<th>CLS Score</th>
			<th>Category</th>
		  </tr>
		  ${res.reduce((acc, curr) => {
				acc +=
					'' +
					`<tr>
			  <td>${curr.value.siteId}</td>
			  <td>${curr.value.url}</td>
			  <td>${curr.value.platform}</td>
			  <td>${curr.value.clsData.score}</td>
			  <td>${curr.value.clsData.category}</td>
			   </tr>`;

				return acc;
			}, '')}
			
		</table>
		</body>
		</html>`;

		return tableFomatData;
	});
}

function sendMailAlertForClsIssues() {
	return prepareDataForAlerts()
		.then(bodyData => {
			if (!bodyData) {
				return;
			}
			return sendEmail({
				queue: 'MAILER',
				data: {
					to: config.consoleErrorAlerts.hackersMail,
					body: bodyData,
					subject: 'Website having CLS issues (score> 0.1)'
				}
			});
		})
		.catch(err => {
			console.log(err);
			return sendEmail({
				queue: 'MAILER',
				data: {
					to: config.consoleErrorAlerts.hackersMail,
					body: err.message,
					subject: 'CLS Monitoring Service fails'
				}
			});
		});
}

sendMailAlertForClsIssues();
var cronJob = cron.schedule(CC.cronSchedule.clsMonitoringService, sendMailAlertForClsIssues, false);
cronJob.start();
