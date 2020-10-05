const express = require('express');
const request = require('request-promise');
const CC = require('../configs/commonConsts');

const router = express.Router();

const HTTP_STATUSES = require('../configs/httpStatusConsts');
const { sendErrorResponse } = require('../helpers/commonFunctions');

router
	.get('/getCustomStats', (req, res) => {
		const {
			query: {
				isSuperUser = false,
				fromDate,
				toDate,
				interval,
				// eslint-disable-next-line camelcase
				page_size,
				page,
				siteid,
				dimension
			}
		} = req;
		const isValidParams = !!(
			(siteid || isSuperUser) &&
			fromDate &&
			toDate &&
			interval &&
			// eslint-disable-next-line camelcase
			page_size &&
			page &&
			siteid
		);

		const reportPath = dimension === 'url' ? CC.URL_REPORT_PATH : CC.UTM_REPORT_PATH;
		if (isValidParams) {
			return request({
				uri: `https://staging.adpushup.com/CentralReportingWebService${reportPath}`,
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
	})
	.get('/getMetaData', (req, res) => {
		const {
			query: { sites = '', isSuperUser = false, product }
		} = req;
		const isValidParams = !!(sites || isSuperUser);

		if (isValidParams) {
			const params = { siteid: sites, isSuperUser, product };

			return request({
				uri: `https://staging.adpushup.com/CentralReportingWebService${CC.ANALYTICS_METAINFO_URL}`,
				json: true,
				qs: params
			})
				.then(response => {
					const { code = -1, data } = response;
					if (code !== 1) return Promise.reject(new Error(response.data));
					return response.code === 1 && data ? res.send(data) && data : res.send({});
				})
				.catch(err => {
					const { message: errorMessage } = err;

					const {
						message = 'Something went wrong',
						code = HTTP_STATUSES.INTERNAL_SERVER_ERROR
					} = errorMessage;
					return sendErrorResponse(
						{
							message
						},
						res,
						code
					);
				});
		}

		return res.send({});
	});

module.exports = router;
