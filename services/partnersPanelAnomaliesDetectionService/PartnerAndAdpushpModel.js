const Class = require('../../helpers/class'),
	axios = require('axios'),
	moment = require('moment'),
	// AdPushupError = require('./AdPushupError'),
	PartnersModel = Class.extend(function() {
		const ADPUSHUP_REPORT_BASE_URL = 'https://api.adpushup.com/CentralReportingWebService';
		const ADPUSHUP_REPORT_PATH = '/site/report?report_name=get_stats_by_custom';

        let domainFieldName = '';
        let revenueFieldName = '';
		// As we need to compare daat from partner and Adpushup db.
		// And both will have different structure, we need to map both the data
		// in a common format and then we can compare it.
		// 1. Both have different siteIds,
		// 2. Both have diferent format for saving site domains.

		// for Partners Data mapping with AdPushup's SiteId
		this.sitesDomainAndIdMapping = {};
		// for AdPushup's Data mapping with Partners Domain
		this.sitesIdAndDomainMapping = {};
		this.siteIdArr = [];

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

		this.getSiteIds = function(partnersData) {
			return this.siteIdArr;
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
				// by mapping it with common domain name format
				this.sitesDomainAndIdMapping[domain] = item;
				// also map same data with siteId
				this.sitesIdAndDomainMapping[siteId] = item;
                this.sitesIdAndDomainMapping[siteId][domainFieldName] = domain;
				return item;
			});
		};

		this.mapPartnersDataWithAdPushupSiteIdAndDomain = function() {
            // All Partners related data processing
			this.partnersData.map(item => {
                if (this.sitesDomainAndIdMapping[item[domainFieldName]]) {
                    const details = { ...this.sitesDomainAndIdMapping[item[domainFieldName]] };
                    // adding publisher's revenue from partner's data into adpushup mapped data
                    this.sitesDomainAndIdMapping[item[domainFieldName]].pubRevenue = item[revenueFieldName];
                    // extact all SiteIds of domains which are matching with partner's data only.
                    this.siteIdArr.push(details.siteId);
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
				.then(({ data: { result: adpData } }) => {
					return adpData.map(item => {
						const { siteid, network_gross_revenue, site } = item;
						return {
							siteid,
							network_gross_revenue,
							site
						};
					});
				})
				.catch(e => {
					console.log(`error in getting ADP data:${e}`);
					throw { error: true };
				});
		};

		this.compareAdPushupDataWithPartnersData = function(adpData) {
			let finalData = [];

			adpData.map(item => {
				// get domain using siteId
				const domainName = this.sitesIdAndDomainMapping[item.siteid][domainFieldName];
				// get data from hash object using domain
				let mappedData = this.sitesDomainAndIdMapping[domainName];
                mappedData.adpRevenue = item.network_gross_revenue;

                const diff = +(mappedData.pubRevenue) - +(mappedData.adpRevenue);
                const total = +(mappedData.pubRevenue) + +(mappedData.adpRevenue);
				mappedData.diff = diff;
				mappedData.diffPer = ((diff / (total/2)) * 100).toFixed(2);
				mappedData.date = moment(item.date).format('YYYY-MM-DD')
				finalData.push(mappedData);
			});
			return finalData;
		};
		this.formatAnomaliesDataForSQL = function(data, NETWORK_ID) {		  
			return data.map(item => {
				return {
					report_date: moment(item.date).format('YYYY-MM-DD'),
					ntwid: NETWORK_ID,
					siteid: item.siteId,
					ap_revenue: item.adpRevenue,
					network_revenue: item.pubRevenue
				}
			})
		};

	});

    module.exports = PartnersModel;
