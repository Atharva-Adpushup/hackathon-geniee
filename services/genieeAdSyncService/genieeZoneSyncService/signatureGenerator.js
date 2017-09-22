var _ = require('lodash'),
	cryptoJs = require('crypto-js'),
	encode = function(data) {
		// using implementation from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FencodeURIComponent
		return encodeURIComponent(data)
			.replace(/[!'()]/g, escape)
			.replace(/\*/g, '%2A');
	},
	stringFromParams = function(params) {
		params = _.map(params, function(val, key) {
			if (typeof val == 'string') {
				return key + '=' + val;
			} else {
				return key + '=' + JSON.stringify(val);
			}
		});
		params.sort(function(a, b) {
			return a.localeCompare(b);
		});
		return params.join('&');
	};

module.exports = function(httpMethod, url, parameters, key) {
	httpMethod = encode(httpMethod);
	url = encode(url);
	parameters = encode(stringFromParams(parameters));
	return cryptoJs.HmacSHA1([httpMethod, url, parameters].join('&'), key + '&').toString(cryptoJs.enc.Base64);
};
