var crypto = require('crypto');

module.exports = (function(crypto) {
	function getOauthNonce() {
		return crypto
			.randomBytes(32)
			.toString('base64')
			.replace(/[^\w]/g, '');
	}

	return {
		getOauthNonce: getOauthNonce
	};
})(crypto);
