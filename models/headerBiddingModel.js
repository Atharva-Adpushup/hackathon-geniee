module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const schema = require('../helpers/schema');
const FormValidator = require('../helpers/FormValidator');
const utils = require('../helpers/utils');

const HeaderBidding = model.extend(function() {
	this.keys = [
		'hbcf',
		'deviceConfig',
		'countryConfig',
		'siteId',
		'siteDomain',
		'email',
		'prebidConfig'
	];
	this.clientKeys = [
		'hbcf',
		'deviceConfig',
		'countryConfig',
		'siteId',
		'siteDomain',
		'email',
		'prebidConfig'
	];
	this.validations = {
		required: []
	};
	this.classMap = {};
	this.defaults = { hbcf: {}, deviceConfig: {} };
	this.constructor = function(data, cas) {
		if (!(data.siteId && data.siteDomain && data.email)) {
			throw new Error('siteId, siteDomain and publisher email required for header bidding doc');
		}
		this.key = `hbcf::${data.siteId}`;
		this.super(data, !!cas);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
	this.getUsedBidders = function() {
		return this.get('hbcf');
	};
	this.saveBidderConfig = function(bidderKey, bidderConfig) {
		const hbcf = this.get('hbcf');
		hbcf[bidderKey] = bidderConfig;
		return Promise.resolve(this);
	};
});

function apiModule() {
	const API = {
		createHBConfigFromJson(json, bidderKey, bidderConfig) {
			return Promise.resolve(new HeaderBidding(json))
				.then(hbConfig => hbConfig.saveBidderConfig(bidderKey, bidderConfig))
				.then(hbConfig => hbConfig.save());
		},
		getAllBiddersFromNetworkConfig() {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync('data::apNetwork'))
				.then(({ value: networks }) => {
					const hbBidders = {};

					for (const key in networks) {
						if (networks[key].isHb && networks[key].isActive) hbBidders[key] = networks[key];
					}

					return hbBidders;
				});
		},
		getUsedBidders(siteId) {
			return API.getHbConfig(siteId)
				.then(hbConfig => hbConfig.getUsedBidders())
				.then(bidders => bidders);
		},
		getMergedBidders(siteId) {
			return Promise.all([API.getAllBiddersFromNetworkConfig(), API.getUsedBidders(siteId)])
				.then(([allBidders, addedBidders]) => {
					const notAddedBidders = { ...allBidders };

					// delete added bidders keys from all bidders
					for (const addedBidderKey in addedBidders) {
						addedBidders[addedBidderKey].config = API.mergeBidderParams(
							{
								...notAddedBidders[addedBidderKey].params.global,
								...notAddedBidders[addedBidderKey].params.siteLevel
							},
							addedBidders[addedBidderKey].config
						);

						delete notAddedBidders[addedBidderKey];
					}

					return { addedBidders, notAddedBidders };
				})
				.catch(err => {
					console.log(err);
				});
		},
		mergeBidderParams(networkConfigBidderparams, addedBidderParams) {
			const mergedBidderparams = { ...addedBidderParams };
			for (const paramKey in mergedBidderparams) {
				const value = mergedBidderparams[paramKey];
				mergedBidderparams[paramKey] = {
					value,
					...networkConfigBidderparams[paramKey]
				};
			}

			return mergedBidderparams;
		},
		getHbConfig(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`hbcf::${siteId}`))
				.then(json => new HeaderBidding(json.value, json.cas))
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError({
							status: 404,
							message: 'Header Bidding Config does not exist'
						});
					}

					return false;
				});
		}
	};

	return API;
}
