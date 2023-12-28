const { GoogleSpreadsheet } = require('google-spreadsheet');
const {
	getCompanyInfoFromMail,
	updateCompanyProperty
} = require('../apiServices/hubspotServices/company');
const { googleSheetCreds } = require('../configs/config');
const { sendDataToZapier } = require('../helpers/commonFunctions');
const { HUBSPOT_PROPERTIES } = require('../apiServices/hubspotServices/constants');
const commonConsts = require('../configs/commonConsts');

const {
	GOOGLE_SPREAD_SHEET_ID: { HB_SOT_SHEET },
	HB_APPROVAL: { ERRORS, HB_SOT_SHEET_TITLE }
} = require('../configs/commonConsts');
const {
	HUBSPOT_PROPERTIES: { COMPANY_ID, HUBSPOT_COMPANY_NAME, SECONDARY_WEBSITES, HB_PIPELINE }
} = require('../apiServices/hubspotServices/constants');

const {
	ZAPIER_SERVICES: { HB_APPROVAL }
} = commonConsts;

const extractCompanyInfo = (rowData, siteDomain) => {
	try {
		let companyInfo = {};
		rowData.forEach(row => {
			const rowDataObj = row._rawData;
			if (rowDataObj[0] === siteDomain) {
				const [websiteUrl, , , hubspotCompanyId, companyName] = rowDataObj;
				companyInfo = {
					hubspotCompanyId,
					companyName,
					websiteUrl,
					siteAlreadyExistsinSOTSheet: true
				};
			}
		});
		return companyInfo;
	} catch (error) {
		throw new Error(error); // Throwing error here which will be handled inside the catch block of headerBiddingController and will be sent to front-end as Internal server error
	}
};

const getCompanyFromSOTSheet = async siteDomain => {
	try {
		const doc = new GoogleSpreadsheet(HB_SOT_SHEET); // spreadsheet id
		const creds = JSON.parse(Buffer.from(googleSheetCreds, 'base64').toString());
		await doc.useServiceAccountAuth(creds);
		await doc.loadInfo();
		const worksheetToUse = doc.sheetsByTitle[HB_SOT_SHEET_TITLE];
		const rows = await worksheetToUse.getRows({
			offset: 1
		});
		const companyInfo = extractCompanyInfo(rows, siteDomain);
		return companyInfo;
	} catch (error) {
		throw new Error(error); // Throwing error here which will be handled inside the catch block of headerBiddingController and will be sent to front-end as Internal server error
	}
};

const getRequiredCompanyDetails = hsCompanyDataResult => {
	try {
		const companyInfoObject = hsCompanyDataResult[0];
		const {
			// properties: { name, hs_object_id: hubspotCompanyId, secondary_websites_2: websiteUrl, secondary_websites: sitesSentForHbApproval }
			properties: {
				[HUBSPOT_COMPANY_NAME]: companyName,
				[COMPANY_ID]: hubspotCompanyId,
				[SECONDARY_WEBSITES]: websiteUrl,
				[HB_PIPELINE]: sitesSentForHbApproval
			}
		} = companyInfoObject;
		const hubspotCompanyInfo = {
			hubspotCompanyId,
			companyName,
			websiteUrl,
			sitesSentForHbApproval
		};
		return hubspotCompanyInfo;
	} catch (error) {
		throw new Error(error); // Throwing error here which will be handled inside the catch block of headerBiddingController and will be sent to front-end as Internal server error
	}
};

const getCompanyInfoFromHubspot = async email => {
	try {
		const hsCompanyDataResponse = await getCompanyInfoFromMail(email);

		const {
			data: {
				data: { results }
			}
		} = hsCompanyDataResponse;
		if (results.length === 0) {
			return {
				error: ERRORS.COMPANY_DOES_NOT_EXIST
			};
		}
		const hubspotCompanyInfo = getRequiredCompanyDetails(results) || {};
		return hubspotCompanyInfo;
	} catch (error) {
		throw new Error(error); // Throwing error here which will be handled inside the catch block of headerBiddingController and will be sent to front-end as Internal server error
	}
};

const getHubspotCompanyInfo = async (siteDomain, email) => {
	try {
		const companyInfoFromSotSheet = await getCompanyFromSOTSheet(siteDomain);
		// If the companyInfo object is empty then no data is found for the domain in the HB SOT Sheet and we fetch the data from hubspot
		if (Object.keys(companyInfoFromSotSheet).length > 0) {
			return companyInfoFromSotSheet;
		}

		const companyResponseObject = await getCompanyInfoFromHubspot(email);
		return companyResponseObject;
	} catch (error) {
		throw new Error(error); // Throwing error here which will be handled inside the catch block of headerBiddingController and will be sent to front-end as Internal server error
	}
};

const getUpdatedSecondaryWebsites = (siteDomain, secondaryWebsites = '') => {
	const secondaryWebsiteDomainsArray =
		secondaryWebsites && secondaryWebsites.length ? secondaryWebsites.split(',') : [];
	secondaryWebsiteDomainsArray.push(siteDomain);
	const secondaryWebsiteDomains = secondaryWebsiteDomainsArray.join();
	return secondaryWebsiteDomains;
};

const getUpdatedHBPipelineWebsites = (siteDomain, siteId, sitesSentForHBApproval = '') => {
	const newSiteToBeAdded = `${siteDomain}:${siteId}`;
	const sitesSentForHBApprovalArray =
		sitesSentForHBApproval && sitesSentForHBApproval.length
			? sitesSentForHBApproval.split(';')
			: [];
	sitesSentForHBApprovalArray.push(newSiteToBeAdded);
	const hbPipelineSitesList = sitesSentForHBApprovalArray.join(';');
	return hbPipelineSitesList;
};

const sendDomainForHBApproval = async (companyInfoObject, email) => {
	try {
		const hubspotCompanyResponseObject = await getCompanyInfoFromHubspot(email);
		const {
			websiteUrl, // secondary_websites_2
			sitesSentForHbApproval // secondary_websites
		} = hubspotCompanyResponseObject;
		const { siteId, companyId, domain } = companyInfoObject;
		return Promise.all([
			sendDataToZapier(HB_APPROVAL.URL, companyInfoObject, HB_APPROVAL.SERVICE_NAME),
			updateCompanyProperty({
				companyId,
				propertyName: HUBSPOT_PROPERTIES.SECONDARY_WEBSITES, // secondary_websites_2
				hubspotData: getUpdatedSecondaryWebsites(domain, websiteUrl)
			}),
			updateCompanyProperty({
				companyId,
				propertyName: HUBSPOT_PROPERTIES.HB_PIPELINE, // secondary_websites
				hubspotData: getUpdatedHBPipelineWebsites(domain, siteId, sitesSentForHbApproval)
			})
		]);
	} catch (error) {
		throw new Error(error); // Throwing error here which will be handled inside the catch block of headerBiddingController and will be sent to front-end as Internal server error
	}
};

module.exports = {
	getCompanyFromSOTSheet,
	getCompanyInfoFromHubspot,
	getHubspotCompanyInfo,
	sendDomainForHBApproval
};
