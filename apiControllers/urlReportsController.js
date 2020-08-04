const express = require('express');
const request = require('request-promise');
const CC = require('../configs/commonConsts');

const router = express.Router();

router.get('/getCustomStats', (req, res) => {
	const {
		query: { siteid = '', isSuperUser = false, fromDate, toDate, interval, dimension }
	} = req;
	const isValidParams = !!((siteid || isSuperUser) && fromDate && toDate && interval);
	console.log(req.query);
	if (isValidParams) {
		return request({
			// uri:`https://staging.adpushup.com/CentralReportingWebService/hb_analytics/report?report_name=GET_STATS_BY_CUSTOM&isSuperUser=true&fromDate=${fromDate}&toDate=${toDate}&dimension=${dimension}`,
			// uri:'https://staging.adpushup.com/CentralReportingWebService/hb_analytics/report?report_name=GET_STATS_BY_CUSTOM&siteid=38903&fromDate=2020-4-21&toDate=2020-4-24',
			uri: `https://staging.adpushup.com/CentralReportingWebService${CC.URL_REPORT_PATH}`,
			json: true,
			qs: req.query
		})
			.then(response => {
				if (response.code == 1 && response.data) return res.send(response.data);
				return res.send({});
			})
			.catch(err => {
				console.log(err);
				return res.send({});
			});
	}

	return res.send({});
});
module.exports = router;
