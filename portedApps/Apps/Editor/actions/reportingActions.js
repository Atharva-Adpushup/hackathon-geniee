import _ from 'lodash';
import { reportingActions, reportingUrl } from 'consts/commonConsts';
import Utils from '../libs/utils';

const generateReport = ({ from, to }) => (dispatch, getState) => {
	const state = getState();
	const {
		channelData: { activeChannel, byIds }
	} = state;
	const pagegroup = byIds[activeChannel].pageGroup;

	Utils.ajax({
		method: 'GET',
		url: reportingUrl,
		data: {
			from,
			to,
			pagegroup,
			siteid: window.ADP_SITE_ID
		}
	})
		.then(response =>
			dispatch({
				type: reportingActions.SET_REPORT,
				data: response.data
			})
		)
		.catch(err => {
			console.log('Error', err);
			return alert('Reporting fetching failed. Please contact AdPushup Tech');
		});
};

export { generateReport };
