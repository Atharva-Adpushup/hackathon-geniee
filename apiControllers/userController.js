const express = require('express');
const userModel = require('../models/userModel');
const config = require('../configs/config');
const crypto = require('crypto');
const router = express.Router();

router
	.get('/', (req, res) => {
		res.status(200).json({ email: 'sdjklf@kewrle.com' });
	})
	.get('/payment', function(req, res) {
		userModel
			.getUserByEmail(req.user.email)
			.then(function(user) {
				var tipaltiConfig = config.tipalti,
					tipaltiUrl = '',
					tipaltiBaseUrl = tipaltiConfig.baseUrl,
					email = user.get('email'),
					payeeId = encodeURIComponent(
						crypto
							.createHash('md5')
							.update(email)
							.digest('hex')
							.substr(0, 64)
					),
					payer = tipaltiConfig.payerName,
					date = Math.floor(+new Date() / 1000),
					paramsStr =
						'idap=' + payeeId + '&payer=' + payer + '&ts=' + date + '&email=' + encodeURIComponent(email),
					key = tipaltiConfig.key,
					hash = crypto
						.createHmac('sha256', key)
						.update(paramsStr.toString('utf-8'))
						.digest('hex'),
					paymentHistoryUrl = tipaltiConfig.paymentHistoryUrl + paramsStr + '&hashkey=' + hash;

				tipaltiUrl = tipaltiBaseUrl + paramsStr + '&hashkey=' + hash;
				res.send({
					tipaltiUrl: tipaltiUrl,
					paymentHistoryUrl: paymentHistoryUrl
				});
			})
			.catch(function(err) {
				res.render('payment', {
					error: 'Some error occurred!'
				});
			});
	});

module.exports = router;
