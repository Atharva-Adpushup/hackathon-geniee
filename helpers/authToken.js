const jwt = require('jsonwebtoken');
const {
	jwt: { salt }
} = require('../configs/config');

const authToken = {
	getAuthToken: json => authToken.generateToken(json, { expiresIn: '24h' }),
	generateToken: (json, options) => jwt.sign(json, salt, options),
	decodeAuthToken: token =>
		jwt.verify(
			token,
			salt,
			(err, decoded) =>
				new Promise((resolve, reject) => {
					if (err) {
						reject(err);
					} else {
						resolve(decoded);
					}
				})
		),
	getAdpToken: () => authToken.generateToken({ isAdpUser: true })
}

module.exports = authToken;
