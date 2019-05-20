module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const schema = require('../helpers/schema');
const FormValidator = require('../helpers/FormValidator');
const utils = require('../helpers/utils');

const HeaderBidding = model.extend(function() {
	this.keys = ['hbConfig', 'deviceConfig', 'siteId', 'siteDomain', 'email'];
	this.clientKeys = ['hbConfig', 'deviceConfig', 'siteId', 'siteDomain', 'email'];
	this.validations = {
		required: []
	};
	this.classMap = {};
	this.defaults = { hbConfig: {}, deviceConfig: {} };
	this.constructor = function(data, cas) {
		if (!(data.siteId && data.siteDomain && data.email)) {
			throw new Error('siteId, siteDomain and publisher email required for header bidding doc');
		}
		this.key = `hbcf::${data.siteId}`;
		this.super(data, !!cas);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
	this.getUsedBidders = function() {
		// TODO: get used bidders

		return Promise.reject('bidders not found');
	};
});

function apiModule() {
	const API = {
		getAllBidders() {
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
		getMergedBidders(siteId) {
			return API.getAllBidders().then(bidders => ({ notAddedBidders: bidders }));
		},
		getHbConfig(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`hbcf::${siteId}`))
				.then(json => new HeaderBidding(json.value, json.cas))
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError([
							{ status: 404, message: 'Header Bidding Config does not exist' }
						]);
					}

					return false;
				});
		}
	};

	return API;
}
