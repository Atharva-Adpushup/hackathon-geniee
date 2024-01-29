const axios = require('axios');
const {
	hubSpotService: { host: hubSpotServiceHost }
} = require('../configs/config');
const { OPERATOR } = require('./hubspotServices/constants');

const getAllCompanyOwnersFromHubspot = async () => {
	try {
		// api/owners
		// Get all owners from the API and filter out using email
		const responseOwnersAPI = await axios.get(`${hubSpotServiceHost}/api/owners`);
		const {
			data: { error, data: allOwners }
		} = responseOwnersAPI;
		if (error) {
			return {};
		}

		const ownerList = allOwners
			.map(ownerDetails => {
				const { email, ownerId } = ownerDetails;
				return { email, ownerId };
			})
			.reduce((acc, owner) => {
				acc[owner.ownerId] = owner.email;
				return acc;
			}, {});
		return ownerList;
	} catch (err) {
		console.log(err);
		return {};
	}
};
const getAllCompaniesWithOwnerIdFromHubspot = async () => {
	try {
		let after = 0;
		const accountsAssociatedWithAM = [];
		// eslint-disable-next-line no-await-in-loop, no-use-before-define

		// handle pagination
		do {
			// eslint-disable-next-line no-await-in-loop, no-use-before-define
			const { results, paging } = await hubSpotService.getCompaniesByOwnerId({ after });
			after = +(paging && paging.next && paging.next.after);
			// fetch and combine paginated accounts for each owner
			accountsAssociatedWithAM.push(...results);
		} while (after);
		return accountsAssociatedWithAM;
	} catch (err) {
		console.log(err);
		return {};
	}
};

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
					return false;
				});
			}
			// not found
			return [];
		} catch (err) {
			throw new Error(err.msg);
		}
	},
	getCompaniesByOwnerId: async ({ ownerId = '', after = 0 }) => {
		// create hubspot API input data
		let filter = { propertyName: 'primary_login_email', operator: OPERATOR.HAS_PROPERTY };

		// fetch owner specific accounts only
		if (ownerId) {
			filter = { propertyName: 'hubspot_owner_id', operator: OPERATOR.EQUAL, value: ownerId };
		}
		const filterGroup = { filters: [filter] };
		const properties = ['hubspot_owner_id', 'domain', 'name', 'primary_login_email', 'company'];
		const limit = 100;

		const publicObjectSearchRequest = {
			filterGroups: [filterGroup],
			properties,
			limit,
			after
		};
		const data = publicObjectSearchRequest;
		// hubspot's fetch company(Adpushup client) data API
		try {
			const {
				data: { error, data: allCompanies }
			} = await axios.post(`${hubSpotServiceHost}/api/companies`, data);

			if (!error && allCompanies && allCompanies.results && allCompanies.results.length) {
				const allCompaniesEmailIncludingPnpApLiteAcc = [];

				// get primary email - Adpushup Client's Email
				// filter out values with null/empty as it indicates that acc is not active
				allCompanies.results.forEach(company => {
					const {
						// eslint-disable-next-line camelcase
						properties: {
							primary_login_email: primaryLoginEmail,
							domain,
							hubspot_owner_id: hubspotOwnerId
						}
					} = company;
					if (typeof primaryLoginEmail === 'string' && typeof domain === 'string') {
						const primaryLoginEmailSanitized = primaryLoginEmail.trim();
						if (primaryLoginEmailSanitized.indexOf(',') !== -1) {
							primaryLoginEmailSanitized.split(/\s*,\s*/).forEach(email => {
								if (email) {
									allCompaniesEmailIncludingPnpApLiteAcc.push({ email, domain, hubspotOwnerId });
								}
							});
						} else {
							allCompaniesEmailIncludingPnpApLiteAcc.push({
								email: primaryLoginEmailSanitized,
								domain,
								hubspotOwnerId
							});
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
			console.log(err);
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
				return hubSpotService.getCompaniesByOwnerId({ ownerId });
			}
			return {
				total: 0,
				results: []
			};
		} catch (err) {
			throw new Error(err.msg);
		}
	},
	getAllSiteDetailsWithTheirOwnerDetails: async () => {
		try {
			const [ownersDetailObj, accountsAssociatedWithAM] = await Promise.all([
				getAllCompanyOwnersFromHubspot(),
				getAllCompaniesWithOwnerIdFromHubspot()
			]);

			const publisherAndAccountManagersMapping = {};
			const domainAndAccountManagersMapping = {};
			accountsAssociatedWithAM.forEach(accountDetail => {
				// to fix issue of subdomain matching
				const domain = accountDetail.domain || '';
				// regEx - <word>.<word>, eg: abc.com
				const match = (domain && domain.match(/\w+.\w+$/)) || [];
				const mainDomain = (match.length && match[0]) || domain;
				domainAndAccountManagersMapping[mainDomain] = {
					...accountDetail,
					owner: ownersDetailObj[accountDetail.hubspotOwnerId]
				};
				publisherAndAccountManagersMapping[accountDetail.email] =
					domainAndAccountManagersMapping[mainDomain];
			});

			return { publisherAndAccountManagersMapping, domainAndAccountManagersMapping };
		} catch (err) {
			console.log(err);
			return {};
		}
	}
};

module.exports = hubSpotService;
