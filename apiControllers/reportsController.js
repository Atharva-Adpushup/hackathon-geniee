const express = require('express');
const request = require('request-promise');
const csv = require('express-csv');
const CC = require('../configs/commonConsts');
const utils = require('../helpers/utils');

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
	})
	.get('/downloadAdpushupReport', (req, res) => {
		const { data } = req.query;

		if (data) {
			try {
				csvData = JSON.parse(utils.atob(data));

				res.setHeader('Content-disposition', 'attachment; filename=adpushup-report.csv');
				res.set('Content-Type', 'text/csv');
				return res.status(200).csv(csvData);
			} catch (e) {
				return res.status(500).send('Some error occurred! Please try again later.');
			}
		} else {
			return res.status(403).send('CSV data to be generated is undefined.');
		}
	});

module.exports = router;
