const express = require('express');
const httpStatus = require('../configs/httpStatusConsts');
const proxy = require('../helpers/proxy');

const router = express.Router();

router.get('/detectAp', (req, res) =>
	proxy
		.detectCustomAp(req.query.url)
		.then(result =>
			result
				? res.status(httpStatus.OK).json({ success: 'Adpushup Code not found!' })
				: res.status(httpStatus.NOT_FOUND).json({ error: 'Adpushup Code not found!' })
		)
		.catch(() => res.status(httpStatus.NOT_FOUND).json({ error: 'Adpushup Code not found!' }))
);

module.exports = router;
