const _ = require('lodash');
const request = require('request-promise');

const { MAB_REPORTING_API } = require('../../configs/commonConsts');
const { subtractDate } = require('../../helpers/commonFunctions');

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
		qs: {
			siteid: siteId,
			fromDate: subtractDate(3),
			toDate: subtractDate(1),
			interval: 'monthly',
			dimension: 'page_variation,page_group,page_variation_type,siteid',
			page_variation_type: 1,
			bypassCache: true
		}
	})
		.then(response => {
			const { data: { result = [] } = {}, code = -1 } = response;
			const isDataValid = result && result.length && code === 1;

			if (!isDataValid) return DEFAULT_DATA;

			const output = { variations: {} };

			_.forEach(result, variation => {
				const { page_variation_id, adpushup_page_views, network_net_revenue } = variation;
				output.variations[page_variation_id] = {
					pageRevenue: parseFloat(network_net_revenue),
					pageViews: parseInt(adpushup_page_views)
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
