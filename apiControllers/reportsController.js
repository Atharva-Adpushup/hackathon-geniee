const express = require('express');
const request = require('request-promise');
const CC = require('../configs/commonConsts');
const router = express.Router();

router
	.get('/getCustomStats', (req, res) => {
		return request({
			uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH}`,
			json: true,
			qs: req.query
		}).then(response => {
			if (response.code == 1) return res.send(response.data);
			else return res.send({});
		});
	})
	.get('/getWidgetData', (req, res) => {
		return request({
			uri: `${CC.ANALYTICS_API_ROOT}${req.query.path}`,
			json: true,
			qs: req.query.params ? JSON.parse(req.query.params) : {}
		}).then(response => {
			if (response.code == 1) return res.send(response.data);
			else return res.send({});
		});
	});

module.exports = router;
