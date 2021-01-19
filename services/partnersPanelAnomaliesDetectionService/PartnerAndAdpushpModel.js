var Class = require('../../helpers/class'),
	// AdPushupError = require('./AdPushupError'),
	PartnersModel = Class.extend(function() {
        const ADPUSHUP_REPORT_BASE_URL = 'https://api.adpushup.com/CentralReportingWebService';
        const ADPUSHUP_REPORT_PATH = '/site/report?report_name=get_stats_by_custom';

        this.sitesDomainAndIdMapping = {};
        this.sitesIdAndDomainMapping = {};
        this.siteIdArr = [];
        
		this.constructor = function(sitesData, domainNameFieldNameInPartnersData) {
            this.sitesData = sitesData;
            // field name for siteName/Domain is different for different partners data
            // to make this common class work with different partnes data, we are using this field
            // as a cntainer for that field name which will be set by partnerWrapper
            this.domainNameFieldNameInPartnersData = domainNameFieldNameInPartnersData;
        };
        this.setPartnersData = function(partnersData) {
            this.partnersData = partnersData;
        }

        this.getSiteIds = function(partnersData) {
            return this.siteIdArr
        }

        this.mapAdPushupSiteIdAndDomainWithPartnersDomain = function() {
            // process and map sites data with publishers API data structure
            this.sitesData.map(item => {
                const domain = item.siteDomain
                    .replace(/(^\w+:|^)\/\//, '')
                    .replace(/^https?:\/\//, '')
                    .replace(/^w+./, '')
                    .replace(/^hw+./, '')
                    .replace(/\/$/, '');
                this.sitesDomainAndIdMapping[domain] = item;
                this.sitesIdAndDomainMapping[item.siteId] = item;
                this.sitesIdAndDomainMapping[item.siteId][this.domainNameFieldNameInPartnersData] = domain;
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
        this.mapPartnersDataWithSiteIdAndDomain = function() {
            console.log(this.sitesDomainAndIdMapping, 'this.sitesDomainAndIdMapping')
            let _data = this.partnersData
            .map(item => {
                const details = {...this.sitesDomainAndIdMapping[item[this.domainNameFieldNameInPartnersData]]};
                console.log(item, this.domainNameFieldNameInPartnersData, 'item in map 1')
                console.log(details, 'details..')
                item.details = details;
                return item;
            })
            .filter(item => !!item.details)
            .map(item => {
                console.log(item, 'item in mappp 2')
                this.sitesDomainAndIdMapping[item[this.domainNameFieldNameInPartnersData]].pubRevenue = item.publisher_revenue;
                this.siteIdArr.push(item.details.siteId);
                return item;
            });
        }
        
        this.compareAdPushupDataWithPartnersData = function(adpData) {
            let finalData = [];
            adpData.map(item => {
                let siteDetail = this.sitesIdAndDomainMapping[item.siteid];
                const fieldName = siteDetail[this.domainNameFieldNameInPartnersData];
                this.sitesDomainAndIdMapping[fieldName].adpRevenue = item.network_gross_revenue;
                this.sitesDomainAndIdMapping[fieldName].diff =
                    this.sitesDomainAndIdMapping[fieldName].pubRevenue - item.network_gross_revenue;
                this.sitesDomainAndIdMapping[fieldName].diffPer =
                    (this.sitesDomainAndIdMapping[fieldName].diff /
                        this.sitesDomainAndIdMapping[fieldName].pubRevenue) *
                    100;
        
                finalData.push(this.sitesDomainAndIdMapping[this.sitesIdAndDomainMapping[item.siteid].site_name]);
            });
            return finalData
        }
        
	});

module.exports = PartnersModel;
