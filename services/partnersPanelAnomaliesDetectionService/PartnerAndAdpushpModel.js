const Class = require('../../helpers/class'),
	axios = require('axios'),
	moment = require('moment'),
	CustomError = require('./CustomError'),
	PartnersModel = Class.extend(function() {
		const ADPUSHUP_REPORT_BASE_URL = 'https://api.adpushup.com/CentralReportingWebService';
		const ADPUSHUP_REPORT_PATH = '/site/report?report_name=get_stats_by_custom';

		let domainFieldName = '';
		let revenueFieldName = '';
		// As we need to compare data from partner and Adpushup db.
		// And both will have different structure, we need to map both the data
		// in a common format and then we can compare it.
		// 1. Both have different siteIds,
		// 2. Both have diferent format for saving site domains.

		// for Partners Data mapping with AdPushup's SiteId
		let sitesDomainAndIdMapping = {};
		// for AdPushup's Data mapping with Partners Domain
		let sitesIdAndDomainMapping = {};
		// for AdPushup's Data mapping with ADP SiteId
		let adpDataSiteIdMapping = {};
		let siteIdArr = [];

		this.constructor = function(sitesData, domainFieldNameFromPartnersAPI, revenueField) {
			this.sitesDataFromAdPushupDB = sitesData;
			// field name for siteName/Domain is different for different partners data
			// to make this common class work with different partnes data, we are using this field
			// as a cntainer for that field name which will be set by partnerWrapper
			domainFieldName = domainFieldNameFromPartnersAPI;
			revenueFieldName = revenueField;
		};
		this.setPartnersData = function(partnersData) {
			this.partnersData = partnersData;
		};

		this.getSiteIds = function() {
			return siteIdArr;
		};

		this.mapAdPushupSiteIdAndDomainWithPartnersDomain = function() {
			// process and map sites data with publishers API data structure
			this.sitesDataFromAdPushupDB.map(item => {
				const { siteId } = item;
				// remove all trailing www, http(s)
				const domain = item.siteDomain
					.replace(/(^\w+:|^)\/\//, '')
					.replace(/^https?:\/\//, '')
					.replace(/^w+./, '')
					.replace(/^hw+./, '')
					.replace(/\/$/, '');

				// creating separate hash maps to easily map Partners Data and AdPushup Data
				// by mapping it with common domain name format. There could be multiple
				// domain entries in DB. So, using Array now.
				if (!sitesDomainAndIdMapping[domain]) {
					sitesDomainAndIdMapping[domain] = {
						sites: [],
						pubRevenue: 0,
						adpRevenue: 0
					};
				}
				sitesDomainAndIdMapping[domain].sites.push(item);

				// also map same data with siteId
				sitesIdAndDomainMapping[siteId] = item;
				sitesIdAndDomainMapping[siteId][domainFieldName] = domain;
				return item;
			});
		};

		this.mapPartnersDataWithAdPushupSiteIdAndDomain = function() {
			const objFreqCounter = {};
			// All Partners related data processing
			this.partnersData.map(item => {
				if (!objFreqCounter[item[domainFieldName]]) {
					objFreqCounter[item[domainFieldName]] = 0;
				}
				objFreqCounter[item[domainFieldName]]++;
				if (sitesDomainAndIdMapping[item[domainFieldName]]) {
					const mappedSitesWithDomain = { ...sitesDomainAndIdMapping[item[domainFieldName]] };
					// extact all SiteIds of domains which are matching with partner's data only.
					mappedSitesWithDomain.sites.forEach(site => {
						// There could be multiple entries for Domain in Pub's Data
						if (objFreqCounter[item[domainFieldName]] > 1) {
							// adding publisher's revenue from partner's data into adpushup mapped data
							sitesDomainAndIdMapping[item[domainFieldName]].pubRevenue += +item[revenueFieldName];
						} else {
							// adding publisher's revenue from partner's data into adpushup mapped data
							sitesDomainAndIdMapping[item[domainFieldName]].pubRevenue = +item[revenueFieldName];
						}

						sitesDomainAndIdMapping[item[domainFieldName]].pubRevenue = +sitesDomainAndIdMapping[
							item[domainFieldName]
						].pubRevenue.toFixed(2);
						sitesDomainAndIdMapping[item[domainFieldName]].adpRevenue = 0;
						siteIdArr.push(site.siteId);
					});
				}
				return item;
			});
		};

		this.getDataFromAdPushup = function(params) {
			return axios
				.get(`${ADPUSHUP_REPORT_BASE_URL}${ADPUSHUP_REPORT_PATH}`, {
					params
				})
				.then(response => response.data)
				.then(response => {
					if (response.code == -1) {
						return Promise.reject(new CustomError(`${response.description} - ${response.data}`));
					}
					const {
						data: { result: adpData }
					} = response;
					return adpData.map(item => {
						const { siteid, network_gross_revenue, site, date } = item;

						// create a mapping of ADP daa with siteId.
						// some domains may have multiple siteIds, it would be easy to fetch
						// revenue using this mapping while calculating revenue of domains with
						// multiple siteId in ADP data.
						adpDataSiteIdMapping[siteid] = item;

						return {
							date,
							siteid,
							network_gross_revenue,
							site
						};
					});
				});
		};

		this.compareAdPushupDataWithPartnersData = function(adpData) {
			let finalData = [];

			Object.keys(sitesDomainAndIdMapping).map(domain => {
				sitesDomainAndIdMapping[domain].sites.map(site => {
					if (adpDataSiteIdMapping[site.siteId]) {
						sitesDomainAndIdMapping[domain].adpRevenue += +adpDataSiteIdMapping[site.siteId]
							.network_gross_revenue;
						sitesDomainAndIdMapping[domain].date = adpDataSiteIdMapping[site.siteId].date;
					}
					sitesDomainAndIdMapping[domain].adpRevenue = +sitesDomainAndIdMapping[
						domain
					].adpRevenue.toFixed(2);
				});
			});

			// ADP data contains domain with multiple siteIds
			Object.keys(sitesDomainAndIdMapping).map(domain => {
				// get data from hash object using domain
				let mappedData = sitesDomainAndIdMapping[domain];

				// if date is undefined then it means it is not present in ADP data
				// ignore those values
				if (mappedData.date) {
					const diff = +mappedData.pubRevenue - +mappedData.adpRevenue;
					const total = +mappedData.pubRevenue + +mappedData.adpRevenue;
					mappedData.diff = diff;
					// prevent divide by zero
					mappedData.diffPer = total > 0 ? ((diff / (total / 2)) * 100).toFixed(2) : 0;
					mappedData.siteDomain = domain;
					mappedData.date = moment(mappedData.date).format('YYYY-MM-DD');
					finalData.push(mappedData);
				}
			});
			return finalData;
		};
		this.formatAnomaliesDataForSQL = function(data, NETWORK_ID) {
			const sqlData = data.map(item => {
				const site = item.sites.shift();
				return {
					report_date: moment(item.date).format('YYYY-MM-DD'),
					ntwid: NETWORK_ID,
					siteid: site.siteId,
					ap_revenue: item.adpRevenue,
					network_revenue: item.pubRevenue
				};
			});
			return {
				anomalyData: sqlData
			};
		};
	});

module.exports = PartnersModel;
