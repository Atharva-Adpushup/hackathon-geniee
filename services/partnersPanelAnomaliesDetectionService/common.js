const axios = require('axios');

const reportingBaseURL = 'https://api.adpushup.com/CentralReportingWebService';
const REPORT_PATH = '/site/report?report_name=get_stats_by_custom';

const mapAdPushupSiteIdAndDomainWithPartnersDomain = function(
	partnersData,
	partnersDomainFieldName
) {
	// process and map sites data with publishers API data structure
	const sitesDomainAndIdMapping = {};
	const sitesIdAndDomainMapping = {};
	partnersData.map(item => {
		const domain = item.siteDomain
			.replace(/(^\w+:|^)\/\//, '')
			.replace(/^https?:\/\//, '')
			.replace(/^w+./, '')
			.replace(/^hw+./, '')
			.replace(/\/$/, '');
		sitesDomainAndIdMapping[domain] = item;
		sitesIdAndDomainMapping[item.siteId] = item;
		sitesIdAndDomainMapping[item.siteId][partnersDomainFieldName] = domain;
		return item;
	});
	return {
		sitesDomainAndIdMapping,
		sitesIdAndDomainMapping
	};
};

const getDataFromAdPushup = function(params) {
	return axios
		.get(`${reportingBaseURL}${REPORT_PATH}`, {
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
const mapPartnersDataWithSiteIdAndDomain = function(reportDataJSON, partnersDomainFieldName, sitesDomainAndIdMapping) {
    let _data = reportDataJSON
    .map(item => {
        const details = sitesDomainAndIdMapping[item[partnersDomainFieldName]];
        item.details = details;
        return item;
    })
    .filter(item => !!item.details)
    .map(item => {
        sitesDomainAndIdMapping[item[partnersDomainFieldName]].pubRevenue = item.publisher_revenue;
        siteIdArr.push(item.details.siteId);
        return item;
    });
    return sitesDomainAndIdMapping
}

const compareAdPushupDataWithPartnersData = function(adpData, partnersDomainFieldName, sitesIdAndDomainMapping, sitesDomainAndIdMapping) {
    let finalData = [];
    adpData.map(item => {
        let siteDetail = sitesIdAndDomainMapping[item.siteid];
        const fieldName = siteDetail[partnersDomainFieldName];
        sitesDomainAndIdMapping[fieldName].adpRevenue = item.network_gross_revenue;
        sitesDomainAndIdMapping[fieldName].diff =
            sitesDomainAndIdMapping[fieldName].pubRevenue - item.network_gross_revenue;
        sitesDomainAndIdMapping[fieldName].diffPer =
            (sitesDomainAndIdMapping[fieldName].diff /
                sitesDomainAndIdMapping[fieldName].pubRevenue) *
            100;

        finalData.push(sitesDomainAndIdMapping[sitesIdAndDomainMapping[item.siteid].site_name]);
    });
    return finalData
}

module.exports = {
	mapAdPushupSiteIdAndDomainWithPartnersDomain,
    getDataFromAdPushup,
    mapPartnersDataWithSiteIdAndDomain,
    compareAdPushupDataWithPartnersData
};
