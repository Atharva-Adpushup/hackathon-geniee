module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const { docKeys } = require('../configs/commonConsts');

const AmpScript = model.extend(function() {
	this.keys = ['ads', 'ownerEmail', 'siteDomain', 'siteId', 'dateCreated'];
	this.clientKeys = ['ads', 'ownerEmail', 'siteDomain', 'siteId', 'dateCreated'];
	this.validations = {
		required: ['ownerEmail', 'siteDomain', 'siteId']
	};
	this.classMap = {};
	this.defaults = { ads: [] };
	this.constructor = function(data, cas) {
		if (!(data.siteId && data.siteDomain && data.ownerEmail)) {
			throw new Error('siteId, siteDomain and publisher email required for header bidding doc');
		}
		this.key = `${docKeys.ampScript}${data.siteId}`;
		this.super(data, !!cas);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
});

function apiModule() {
	const API = {
		getAmpScriptConfig(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`${docKeys.ampScript}${siteId}`))
				.then(json => new AmpScript(json.value, json.cas))
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError({
							status: 404,
							message: 'AMP Script Config does not exist'
						});
					}

					return false;
				});
		}
	};

	return API;
}
