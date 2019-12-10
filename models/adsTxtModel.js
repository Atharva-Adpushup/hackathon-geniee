module.exports = apiModule();

const { N1qlQuery } = require('couchbase');
const request = require('request-promise');
const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');

const AdPushupError = require('../helpers/AdPushupError');
const siteModel = require('./siteModel');
const userModel = require('./userModel');
const channelModel = require('./channelModel');
const commonConsts = require('../configs/commonConsts');

const commonFunctions = require('../helpers/commonFunctions');

const config = require('../configs/config');
const { docKeys } = require('../configs/commonConsts');

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
		}
	};
	return API;
}
