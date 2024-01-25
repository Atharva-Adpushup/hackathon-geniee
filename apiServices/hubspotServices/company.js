const axios = require('axios');
const {
	hubSpotService: { host: hubSpotServiceHost }
} = require('../../configs/config');
const {
	OPERATOR: { IN },
	HUBSPOT_PROPERTIES: { AP_LOGIN_EMAIL, HUBSPOT_COMPANY_NAME, SECONDARY_WEBSITES, HB_PIPELINE },
	MAX_COMPANY_RESULT_LIMIT
} = require('./constants');

const companyHubspotServices = {
	updateCompanyProperty: async revenueData => {
		try {
			const { data } = await axios.post(
				`${hubSpotServiceHost}/api/company/updateCompanyProperty`,
				revenueData
			);
			return data;
		} catch (err) {
			console.log('Error in updating company details in hubspot', err);
			throw new Error(err.msg);
		}
	},
	getCompanyInfoFromMail: email => {
		try {
			const filterGroup = {
				filters: [
					{
						propertyName: AP_LOGIN_EMAIL,
						operator: IN,
						values: [email]
					}
				]
			};
			const properties = [HUBSPOT_COMPANY_NAME, SECONDARY_WEBSITES, HB_PIPELINE];
			const limit = MAX_COMPANY_RESULT_LIMIT;
			const hubspotQuery = {
				filterGroups: [filterGroup],
				properties,
				limit
			};
			return axios.post(`${hubSpotServiceHost}/api/companies`, hubspotQuery);
		} catch (err) {
			console.log(err);
			throw new Error(err.msg);
		}
	}
};

module.exports = companyHubspotServices;
