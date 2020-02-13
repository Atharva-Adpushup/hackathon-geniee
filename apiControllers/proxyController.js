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
					? res.status(httpStatus.OK).json({ success: 'Adpushup Code found!', ap: result })
					: res.status(httpStatus.NOT_FOUND).json({ error: 'Adpushup Code not found!', ap: result })
			)
			.catch(() =>
				res.status(httpStatus.NOT_FOUND).json({ error: 'Adpushup Code not found!', ap: false })
			)
	)
	.get('/verifyAdsTxt', (req, res) => {
		const getAdsTxtData = [
			proxy.fetchOurAdsTxt(),
			proxy.getMandatoryAdsTxtEntryBySite(req.query.siteId)
		];

		Promise.all(getAdsTxtData)
			.then(data => {
				const [ourAdsTxt, mandatoryAdsTxtEntry] = data;
				return proxy.verifyAdsTxt(req.query.url, ourAdsTxt, mandatoryAdsTxtEntry);
			})
			.then(() => res.status(httpStatus.OK).json({ success: 'Our Ads.txt entries found!' }))
			.catch(err => {
				if (err instanceof AdPushupError) {
					return res
						.status(err.message.httpCode)
						.json({ error: err.message.error, data: err.message.data });
				}

				return res
					.status(httpStatus.INTERNAL_SERVER_ERROR)
					.json({ error: 'Something went wrong!' });
			});
	})
	.get('/getAdsTxt', (req, res) =>
		proxy
			.fetchOurAdsTxt()
			.then(adsTxtSnippet => res.status(httpStatus.OK).json({ adsTxtSnippet }))
			.catch(() =>
				res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Something went wrong!' })
			)
	)
	.get('/getMandatoryAdsTxtEntry', (req, res) =>
		proxy
			.getMandatoryAdsTxtEntry(req.query)
			.then(mandatoryAdsTxtEntry => res.status(httpStatus.OK).send({ mandatoryAdsTxtEntry }))
	);

module.exports = router;
