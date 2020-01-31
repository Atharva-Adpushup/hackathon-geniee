module.exports = apiModule();

const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');
const { docKeys } = require('../configs/commonConsts');

const ApLite = model.extend(function() {
	this.keys = ['siteId', 'adUnits'];
	this.clientKeys = ['siteId', 'adUnits'];
	this.validations = {
		required: []
	};
	this.classMap = {};
	this.defaults = {};
	this.constructor = function(data, cas) {
		if (!data.siteId) {
			throw new Error('AP Lite model need siteId');
		}
		this.key = `${docKeys.apLite}${data.siteId}`;
		this.super(data, cas ? true : false);
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
	};
});

function apiModule() {
	var API = {
		saveAdUnits: json => {
			return API.getAPLiteModelBySite(json.siteId)
				.then(adUnits => {
					adUnits.set('adUnits', json.adUnits);

					return adUnits.save();
				})
				.catch(err => {
					if (err.code === 13) {
						const apLite = new ApLite(json);
						return apLite.save();
					}
				});
		},

		getAPLiteModelBySite(siteId) {
			return couchbase
				.connectToAppBucket()
				.then(appBucket => appBucket.getAsync(`${docKeys.apLite}${siteId}`))
				.then(({ value, cas }) => new ApLite(value, cas));
		}
	};
	return API;
}
