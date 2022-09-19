/*  
- Run the headless automation for the pre-defined site list
- To start with, pick the top 50 sites in the AdPushup book by revenue
- Get the article/category pages using data from the backend (exclude home and pick the other top 5 pages - for any  confusion, reach out to Abhishek Sontakke)
- Use the PerformanceObserver API (or a better alternative if available) to highlight CLS issues
- Trigger for issues - CLS value > 0.1
*/

const request = require('request-promise');
const cron = require('node-cron');
const { GoogleSpreadsheet } = require('google-spreadsheet');

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
			json: true
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

function generateCSVFormatData(response) {
	const csvResponse = response.map(entry => {
		const { siteId, url, platform, clsData: { score, category } = {} } = entry.value;
		return {
			siteId,
			url,
			platform,
			score,
			category
		};
	});

	return csvResponse;
}

async function prepareDataForAlerts() {
	const res = await filterCLSUrlsToSend();

	if (!res.length) {
		return;
	}

	const csvData = generateCSVFormatData(res);

	const doc = new GoogleSpreadsheet(CC.GOOGLE_SPREAD_SHEET_ID); //spreadsheet id

	const creds = JSON.parse(Buffer.from(config.googleSheetCreds, 'base64').toString());

	await doc.useServiceAccountAuth(creds);

	await doc.loadInfo();

	const worksheet = doc.sheetsByIndex[0];

	//clear the sheet before populating it again
	await worksheet.clear();

	// This is the header row.
	await worksheet.setHeaderRow(['siteId', 'url', 'platform', 'score', 'category']);
	// write values to the sheet
	await worksheet.addRows(csvData);

	const spreadSheetLink = `https://docs.google.com/spreadsheets/d/${CC.GOOGLE_SPREAD_SHEET_ID}/edit#gid=0`;

	const tableFormatData = `<html>
		<body>
		<table>
		  <tr>
			<th>Site Id</th>
			<th>Page Url</th>
			<th>Platform</th>
			<th>CLS Score</th>
			<th>Category</th>
		  </tr>
		  ${csvData.reduce((acc, curr) => {
				const { siteId, url, platform, score, category } = curr;
				acc +=
					'' +
					`<tr>
			  <td>${siteId}</td>
			  <td>${url}</td>
			  <td>${platform}</td>
			  <td>${score}</td>
			  <td>${category}</td>
			   </tr>`;

				return acc;
			}, '')}
			
		</table>
		<br>
		<h4>You can also check the spreadsheet of this result from the link below</h4>
		<p>${spreadSheetLink}</p>
		</body>
		</html>`;

	return tableFormatData;
}

async function sendMailAlertForClsIssues() {
	try {
		const tableFormatData = await prepareDataForAlerts();

		if (!tableFormatData) {
			return;
		}

		return sendEmail({
			queue: 'MAILER',
			data: {
				to: `${config.clsMonitoringAlerts.hackersMail},${config.clsMonitoringAlerts.opsMail}`,
				body: tableFormatData,
				subject: 'Website having CLS issues (score> 0.1)'
			}
		});
	} catch (err) {
		console.log(err);
		return sendEmail({
			queue: 'MAILER',
			data: {
				to: config.clsMonitoringAlerts.hackersMail,
				body: err.message,
				subject: 'CLS Monitoring Service fails'
			}
		});
	}
}

cron.schedule(CC.cronSchedule.clsMonitoringService, sendMailAlertForClsIssues);
