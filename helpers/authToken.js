const jwt = require('jsonwebtoken');
const {
	jwt: { salt }
} = require('../configs/config');

module.exports = {
	getAuthToken: json => jwt.sign(json, salt, { expiresIn: '24h' }),
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
		)
};
