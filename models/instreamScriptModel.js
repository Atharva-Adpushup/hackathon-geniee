module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const { docKeys } = require('../configs/commonConsts');

const InstreamScript = model.extend(function() {
	this.keys = ['siteId', 'siteDomain', 'mcmId', 'videoPlayerId', 'prebid', 'ads', 'dateCreated'];
	this.clientKeys = [
		'siteId',
		'siteDomain',
		'mcmId',
		'videoPlayerId',
		'prebid',
		'ads',
		'dateCreated'
	];
	this.validations = {
		required: ['siteId', 'siteDomain']
	};
	this.classMap = {};
	this.defaults = { ads: [] };
	this.constructor = function(data, cas) {
		if (!(data.siteId && data.siteDomain)) {
			throw new Error('siteId and siteDomain required for instream doc');
		}
		this.key = `${docKeys.instreamScript}${data.siteId}`;
		this.super(data, !!cas);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
});

function apiModule() {
	const API = {
		getInstreamScriptConfig(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`${docKeys.instreamScript}${siteId}`))
				.then(json => new InstreamScript(json.value, json.cas))
				.catch(err => {
					if (err.code === 13) {
						throw new AdPushupError({
							status: 404,
							message: 'Instream Script Config does not exist'
						});
					}

					return false;
				});
		}
	};

	return API;
}
