const axios = require('axios');
const {
	hubSpotService: { host: hubSpotServiceHost }
} = require('../configs/config');

const hubSpotService = {
	getOwnerIdOfUserInHubspot: async email => {
		try {
			// api/owners
			// Get all owners from the API and filter out using email
			const {
				data: { error, data: allOwners }
			} = await axios.get(`${hubSpotServiceHost}/api/owners`);

			// filter out the specific user with email
			if (!error && allOwners && allOwners.length) {
				return allOwners.find(ownerObj => {
					if (ownerObj.email === email) {
						return true;
					}
				});
			}
			// not found
			return [];
		} catch (err) {
			throw new Error(err.msg);
		}
	},
	getCompaniesByOwnerId: async ownerId => {
		// create hubspot API input data
		const AFTER = undefined;
		const filter = { propertyName: 'hubspot_owner_id', operator: 'EQ', value: ownerId };
		const filterGroup = { filters: [filter] };
		const properties = ['hubspot_owner_id', 'domain', 'name', 'primary_login_email', 'company'];
		const limit = 100;

		const publicObjectSearchRequest = {
			filterGroups: [filterGroup],
			properties,
			limit,
			AFTER
		};
		const data = publicObjectSearchRequest;
		// hubspot's fetch company(Adpushup client) data API
		try {
			const {
				data: { error, data: allCompanies }
			} = await axios.post(`${hubSpotServiceHost}/api/companies`, data);

			if (!error && allCompanies && allCompanies.results.length) {
				const allCompaniesEmailIncludingPnpApLiteAcc = [];

				// get primary email - Adpushup Client's Email
				// filter out values with null/empty as it indicates that acc is not active
				allCompanies.results.forEach(company => {
					const {
						// eslint-disable-next-line camelcase
						properties: { primary_login_email }
					} = company;
					if (
						typeof company.properties.primary_login_email === 'string' &&
						typeof company.properties.domain === 'string'
					) {
						const primaryLoginEmail = primary_login_email.trim();
						// for PnP and ApLite accounts
						// we will get comma-separated emails
						if (primaryLoginEmail.indexOf(',') !== -1) {
							primaryLoginEmail.split(/\s*,\s*/).forEach(email => {
								if (email) {
									allCompaniesEmailIncludingPnpApLiteAcc.push(email);
								}
							});
						} else {
							allCompaniesEmailIncludingPnpApLiteAcc.push(primaryLoginEmail);
						}
					}
				});

				allCompanies.results = allCompaniesEmailIncludingPnpApLiteAcc;
				return allCompanies;
			}
			return {
				total: 0,
				results: []
			};
		} catch (err) {
			throw new Error(err.msg);
		}
	},
	getSitesOfUserFromHubspot: async emailId => {
		try {
			// get owner id from hubspot of user with email
			const ownerDetail = await hubSpotService.getOwnerIdOfUserInHubspot(emailId);
			if (ownerDetail && ownerDetail.ownerId) {
				const { ownerId } = ownerDetail;
				// use hubspot owner idto get account details
				// eg: if Adpushup User X is associated with our client site
				// Y (xyz.com) then get main email of Y
				return hubSpotService.getCompaniesByOwnerId(ownerId);
			}
			return {
				total: 0,
				results: []
			};
		} catch (err) {
			throw new Error(err.msg);
		}
	}
};

module.exports = hubSpotService;
