const express = require('express');
const request = require('request-promise');
const CC = require('../configs/commonConsts');

const router = express.Router();

router.get('/getCustomStats', (req, res) => {
	const {
		query: {
			isSuperUser = false,
			fromDate,
			toDate,
			interval,
			// eslint-disable-next-line camelcase
			top_select_criteria,
			// eslint-disable-next-line camelcase
			page_size,
			page,
			siteid
		}
	} = req;
	const isValidParams = !!(
		(siteid || isSuperUser) &&
		fromDate &&
		toDate &&
		interval &&
		// eslint-disable-next-line camelcase
		top_select_criteria &&
		// eslint-disable-next-line camelcase
		page_size &&
		page &&
		siteid
	);

	if (isValidParams) {
		return request({
			uri: `https://staging.adpushup.com/CentralReportingWebService${CC.URL_REPORT_PATH}`,
			json: true,
			qs: req.query
		})
			.then(response => {
				if (response.code === 1 && response.data) return res.send(response.data);
				return res.send({});
			})
			.catch(err => res.send({ err }));
	}

	return res.send({});
});
module.exports = router;
