const jwt = require('jsonwebtoken');
const {
	jwt: { salt, refreshTokenConfig }
} = require('../configs/config');

const authToken = {
	getAuthToken: json => authToken.generateToken(json, { expiresIn: '24h' }),
	generateToken: (json, options) => jwt.sign(json, salt, options),
	generateRefreshToken: json => {
		const { salt: refreshTokenSalt, expiresIn } = refreshTokenConfig;
		const options = {
			expiresIn
		};
		return jwt.sign(json, refreshTokenSalt, options);
	},
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
};

module.exports = authToken;
