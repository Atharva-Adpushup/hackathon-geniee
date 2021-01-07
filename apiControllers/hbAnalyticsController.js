const express = require('express');
const request = require('request-promise');
const _ = require('lodash');

const CC = require('../configs/commonConsts');
const utils = require('../helpers/utils');

const router = express.Router();

router
	.get('/getCustomStats', (req, res) => {
		const {
			query: { siteid = '', isSuperUser = false, fromDate, toDate, interval, dimension }
		} = req;
		const isValidParams = !!(
			(siteid || isSuperUser) &&
			fromDate &&
			toDate &&
			interval &&
			dimension
		);

		if (isValidParams) {
			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${CC.HB_REPORT_PATH}`,
				json: true,
				qs: req.query
			})
				.then(response => {
					if (response.code === 1 && response.data) return res.send(response.data) && response.data;
					return res.send({});
				})
				.catch(err => res.send({ err }));
		}

		return res.send({});
	})
	.get('/getBidCPMStats', (req, res) => {
		const {
			query: { siteid = '', fromDate, toDate }
		} = req;
		const isValidParams = !!(siteid && fromDate && toDate);

		if (isValidParams) {
			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${CC.HB_BID_CPM_STATS_REPORT_PATH}`,
				json: true,
				qs: req.query
			})
				.then(response => {
					if (response.code === 1 && response.data) return res.send(response.data) && response.data;
					return res.send({});
				})
				.catch(err => res.send({ err }));
		}

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
					if (response.code === 1 && response.data) return res.send(response.data);
					return res.send({});
				})
				.catch(err => res.send({ err }));
		return res.send({});
	})
	.get('/downloadAdpushupReport', (req, res) => {
		const { data, fileName } = req.query;

		if (data) {
			try {
				const csvData = JSON.parse(utils.atob(data));

				res.setHeader('Content-disposition', `attachment; filename=${fileName}.csv`);
				res.set('Content-Type', 'text/csv');

				const headers = {};
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
			.catch(err => res.send({ err }))
	)
	.get('/getMetaData', (req, res) => {
		const {
			query: { sites = '', isSuperUser = false }
		} = req;
		const isValidParams = !!(sites || isSuperUser);

		if (isValidParams) {
			const params = { siteid: sites, product: 'hb-analytics', isSuperUser };

			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
				json: true,
				qs: params
			})
				.then(response =>
					response.code === 1 && response.data
						? res.send(response.data) && response.data
						: res.send({})
				)
				.catch(() => res.send({}));
		}

		return res.send({});
	});

module.exports = router;
