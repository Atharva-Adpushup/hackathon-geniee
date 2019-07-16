const _ = require('lodash');
const request = require('request-promise');

const { MAB_REPORTING_API } = require('../../configs/commonConsts');

const DEFAULT_DATA = {
	status: false,
	data: {}
};

function init(site) {
	const siteId = site.get('siteId');

	return request({
		method: 'GET',
		uri: MAB_REPORTING_API,
		json: true,
		qs: { siteid: siteId }
	})
		.then(response => {
			const { data: { result = [] } = {}, code = -1 } = response;
			const isDataValid = result && result.length && code === 1;

			if (!isDataValid) return DEFAULT_DATA;

			const output = { variations: {} };

			_.forEach(result, variation => {
				const { variation_id, page_views, revenue } = variation;
				output.variations[variation_id] = {
					pageRevenue: parseFloat(revenue),
					pageViews: parseInt(page_views)
				};
			});
			return {
				status: true,
				data: output
			};
		})
		.catch(err => {
			console.log('CDN Sync Failed while fetching data', err);
			return DEFAULT_DATA;
		});
}

module.exports = init;
