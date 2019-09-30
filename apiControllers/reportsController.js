const express = require('express');
const request = require('request-promise');
const csv = require('express-csv');
const _ = require('lodash');
const CC = require('../configs/commonConsts');
const utils = require('../helpers/utils');

const router = express.Router();

router
	.get('/getCustomStats', (req, res) => {
		const siteIds = req.query && req.query.siteid ? req.query.siteid : '';
		if (siteIds)
			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${CC.REPORT_PATH}`,
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
		return res.send({});
	})
	.get('/getWidgetData', (req, res) => {
		const { params, path } = req.query;
		const reqParams = _.isString(params) ? JSON.parse(params) : {};
		const { siteid, isSuperUser } = reqParams;
		const isValidParams = !!(siteid || (isSuperUser && !siteid));

		if (isValidParams)
			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${path}`,
				json: true,
				qs: reqParams
			})
				.then(response => {
					if (response.code == 1 && response.data) return res.send(response.data);
					return res.send({});
				})
				.catch(err => {
					console.log(err);
					return res.send({});
				});
		return res.send({});
	})
	.get('/downloadAdpushupReport', (req, res) => {
		const { data , fileName} = req.query;


		if (data) {
			try {
				const csvData = JSON.parse(utils.atob(data));

				res.setHeader('Content-disposition', `attachment; filename=${fileName}.csv`);
				res.set('Content-Type', 'text/csv');

				var headers = {};
				for (key in csvData[0]) {
					headers[key] = key;
				}

				csvData.unshift(headers);

				return res.status(200).csv(csvData);
			} catch (e) {
				return res.status(500).send('Some error occurred! Please try again later.');
			}
		} else {
			return res.status(403).send('CSV data to be generated is undefined.');
		}
	})
	.get('/getLastUpdateStatus', (req, res) =>
		request({
			method: 'GET',
			uri: `${CC.REPORT_STATUS}`
		})
			.then(result => res.send(result))
			.catch(err => {
				console.log(err);
				return res.send({});
			})
	)
	.get('/getMetaData', (req, res) => {
		const {
			user: { isSuperUser },
			query: { sites = '' }
		} = req;
		const params = { siteid: sites, isSuperUser };

		return request({
			uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
			json: true,
			qs: params
		})
			.then(response =>
				response.code == 1 && response.data ? res.send(response.data) : res.send({})
			)
			.catch(err => res.send({}));
	});

module.exports = router;
