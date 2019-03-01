const express = require('express');
const httpStatus = require('../configs/httpStatusConsts');
const proxy = require('../helpers/proxy');
const AdPushupError = require('../helpers/AdPushupError');

const router = express.Router();

router
	.get('/detectAp', (req, res) =>
		proxy
			.detectCustomAp(req.query.url, req.query.siteId)
			.then(result =>
				result
					? res.status(httpStatus.OK).json({ success: 'Adpushup Code not found!' })
					: res.status(httpStatus.NOT_FOUND).json({ error: 'Adpushup Code not found!' })
			)
			.catch(() => res.status(httpStatus.NOT_FOUND).json({ error: 'Adpushup Code not found!' }))
	)
	.get('/verifyAdsTxt', (req, res) =>
		proxy
			.fetchOurAdsTxt()
			.then(ourAdsTxt =>
				proxy
					.verifyAdsTxt(req.query.url, ourAdsTxt)
					.then(() => res.status(httpStatus.OK).json({ success: 'Ads.txt verified successfully!' }))
					.catch(err => {
						if (err instanceof AdPushupError) {
							return res
								.status(err.message.httpCode)
								.json({ error: err.message.error, ourAdsTxt: err.message.ourAdsTxt });
						}
						throw err;
					})
			)
			.catch(err => {
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' });
			})
	)
	.get('/getAdsTxt', (req, res) =>
		proxy
			.fetchOurAdsTxt()
			.then(adsTxtSnippet => res.status(httpStatus.OK).json({ adsTxtSnippet }))
			.catch(err =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' })
			)
	);

module.exports = router;
