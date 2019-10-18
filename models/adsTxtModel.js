module.exports = apiModule();

const request = require('request-promise');
const model = require('../helpers/model');
const couchbase = require('../helpers/couchBaseService');
const AdPushupError = require('../helpers/AdPushupError');

const config = require('../configs/config');

const AdsTxt = model.extend(function() {
	this.keys = ['siteId', 'ownerEmail', 'missingEntries', 'presentEntries', 'allPresent'];
	this.clientKeys = ['siteId', 'ownerEmail', 'missingEntries', 'presentEntries', 'allPresent'];
	this.validations = {
		required: []
	};
	this.classMap = {};
	this.defaults = { missingEntries: '', presentEntries: '', allPresent: '' };
	this.constructor = function(data, cas) {
		if (!(data.siteId && data.ownerEmail)) {
			throw new Error('siteId  and owner email required for adsTxt Doc');
		}
		this.casValue = cas; // if user is loaded from database which will be almost every time except first, this value will be thr
		this.super(data, !!cas);
	};
});

function apiModule() {
	var API = {};
}
