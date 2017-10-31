import _ from 'lodash';
import { reportingActions } from 'consts/commonConsts';
import Utils from '../libs/utils';
import { reportingUrl } from 'consts/commonConsts';

const generateReport = ({ from, to }) => (dispatch, getState) => {
	let pagegroupNames = _.uniq(_.map(getState().channelData.byIds, 'pageGroup'));
	let variationNames = Object.keys(getState().variationByIds);
	return Utils.ajax({
		method: 'POST',
		url: reportingUrl,
		data: JSON.stringify({
			select: ['total_xpath_miss', 'total_impressions', 'total_revenue', 'report_date', 'siteid'],
			where: {
				siteid: ADP_SITE_ID,
				pagegroup: pagegroupNames,
				variation: variationNames,
				from: from,
				to: to
			},
			groupBy: ['section'],
			needAggregated: true
		})
	}).then(response => {
		if (response.error) {
			alert('Some error occured while fetching reports');
			return;
		}
		dispatch({
			type: reportingActions.SET_REPORT,
			data: response.data
		});
	});
};

export { generateReport };
