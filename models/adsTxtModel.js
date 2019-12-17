module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const { docKeys } = require('../configs/commonConsts');
const siteModel = require('./siteModel');
const proxy = require('../helpers/proxy');

const AdsTxt = model.extend(function() {
	this.keys = ['siteId', 'domain', 'accountEmail', 'adsTxt'];
	this.clientKeys = ['siteId', 'domain', 'accountEmail', 'adsTxt'];
	this.validations = {
		required: []
	};
	this.classMap = {};
	this.defaults = {};
	this.constructor = function(data, cas) {
		if (!data.siteId) {
			throw new Error('Site model need siteId');
		}
		this.key = `${docKeys.adsTxt}${data.siteId}`;
		this.super(data, cas ? true : false);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
});

function apiModule() {
	var API = {
		saveAdsTxt: json => {
			return API.getAdsTxtBySite(json.siteId)
				.then(adsTxt => {
					adsTxt.set('adsTxt', json.adsTxt);
					return adsTxt.save();
				})
				.catch(err => {
					if (err.code === 13) {
						const adsTxt = new AdsTxt(json);
						return adsTxt.save();
					}
				});
		},

		getAdsTxtBySite(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`${docKeys.adsTxt}${siteId}`))
				.then(({ value, cas }) => new AdsTxt(value, cas));
		},

		getAdsTxtEntries(siteId, adsTxtSnippet, currentSelectedEntry) {
			const ourAdsTxt = proxy.fetchOurAdsTxt();
			const siteIdArr = siteId.split(',');
			function adsTxtProcessing(adsTxtData) {
				const { accountEmail, adsTxt, domain, siteId } = adsTxtData;
				let commonOutput = {
					domain,
					siteId,
					accountEmail
				};
				return ourAdsTxt
					.then(ourAdsTxtEntries =>
						proxy.verifyActiveSitesAdsTxt(
							(ourAdsTxtEntries = adsTxtSnippet ? adsTxtSnippet : ourAdsTxtEntries),
							adsTxt
						)
					)
					.then(adsTxt => ({
						status: 1,
						message: 'All Entries Available',
						adsTxtEntries: adsTxt,
						...commonOutput
					}))

					.catch(err => {
						if (err instanceof AdPushupError) {
							const {
								message: { httpCode = 404, ourAdsTxt, presentEntries }
							} = err;
							let output = null;

							switch (httpCode) {
								case 204:
									output = {
										status: 2,
										message: "Our Ads.txt entries not found in publisher's ads.txt",
										adsTxtEntries: ourAdsTxt,
										...commonOutput
									};
									break;
								case 206:
									if (currentSelectedEntry === 'Missing Entries')
										output = {
											status: 3,
											message: "Some entries not found in publisher's ads.txt",
											adsTxtEntries: ourAdsTxt,
											...commonOutput
										};
									else if (currentSelectedEntry === 'Present Entries')
										output = {
											status: 3,
											message: "Present entries found in publisher's ads.txt",
											adsTxtEntries: presentEntries,
											...commonOutput
										};
									else
										output = {
											status: 3,
											message: 'All Ads.txt Entries Not Present For this site',
											adsTxtEntries: { ourAdsTxt, presentEntries },
											...commonOutput
										};

									break;
								default:
								case 404:
									output = {
										status: 4,
										message: "Publisher's ads.txt not found",
										...commonOutput
									};
									break;
							}

							return Promise.resolve(output);
						}
						return Promise.reject(err);
					});
			}

			return siteModel
				.getActiveSites()
				.then(sites => {
					const sitesPromises = !siteId
						? sites.map(site =>
								API.getAdsTxtBySite(site.siteId).then(({ data }) => {
									return adsTxtProcessing(data);
								})
						  )
						: siteIdArr.map(siteId =>
								API.getAdsTxtBySite(parseInt(siteId.trim())).then(({ data }) => {
									return adsTxtProcessing(data);
								})
						  );

					return Promise.all(sitesPromises);
				})

				.catch(err => {
					console.log(err);
					throw new AdPushupError('Something went wrong');
				});
		}
	};
	return API;
}
