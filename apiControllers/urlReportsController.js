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
		const utmFilter = {
			utm_campaign: 2,
			utm_source: 3,
			utm_medium: 4,
			utm_term: 5,
			utm_content: 6,
			utm_camp_src_med: 7,
			utm_camp_src: 8
		};
		const utmPrams = utmFilter[dimension] ? `&utm_params=${utmFilter[dimension]}` : '';

		if (isValidParams) {
			return request({
				uri: `${CC.ANALYTICS_API_ROOT}${reportPath}${utmPrams}`,
				json: true,
				qs: req.query
			})
				.then(response => {
					if (response.code === 1 && response.data) {
						return res.send(response.data) && response.data;
					}
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
				uri: `${CC.ANALYTICS_API_ROOT}${CC.ANALYTICS_METAINFO_URL}`,
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
