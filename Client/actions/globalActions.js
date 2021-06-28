import {
	USER_ACTIONS,
	NETWORK_CONFIG_ACTIONS,
	SITE_ACTIONS,
	REPORTS_ACTIONS,
	URL_REPORTS_ACTIONS,
	HB_ANALYTICS_ACTIONS,
	UI_ACTIONS,
	NETWORK_WIDE_RULES_ACTIONS
} from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';
import { errorHandler } from '../helpers/commonFunctions';
import * as service from '../services/opsService';

const fetchGlobalData = () => dispatch =>
	axiosInstance
		.get('/globalData')
		.then(response => {
			const { data } = response;
			dispatch({
				type: USER_ACTIONS.REPLACE_USER_DATA,

				data: data.user
			});
			dispatch({
				type: NETWORK_CONFIG_ACTIONS.REPLACE_NETWORK_CONFIG,
				data: data.networkConfig
			});
			dispatch({
				type: SITE_ACTIONS.REPLACE_SITE_DATA,
				data: data.sites
			});

			dispatch({
				type: NETWORK_WIDE_RULES_ACTIONS.FETCH_NETWORK_WIDE_RULES,
				data: data.networkWideHBRules
			});
		})
		.catch(err => errorHandler(err));

const updateGlobalReportMetaData = data => dispatch =>
	dispatch({
		type: REPORTS_ACTIONS.REPLACE_GLOBAL_REPORT_DATA,
		data
	});

const updateAccountReportMetaData = data => dispatch =>
	dispatch({
		type: REPORTS_ACTIONS.REPLACE_ACCOUNT_REPORT_DATA,
		data
	});

const updateGlobalURLReportsMetaData = data => dispatch =>
	dispatch({
		type: URL_REPORTS_ACTIONS.REPLACE_GLOBAL_URL_REPORTS_DATA,
		data
	});

const updateGlobalHBAnalyticMetaData = data => dispatch =>
	dispatch({
		type: HB_ANALYTICS_ACTIONS.REPLACE_GLOBAL_HB_ANALYTIC_DATA,
		data
	});

const updateNetworkConfig = (config, dataForAuditLogs) => dispatch =>
	axiosInstance
		.post('/updateNetworkConfig', { config, dataForAuditLogs })
		.then(response => {
			const { data } = response;
			dispatch({
				type: NETWORK_CONFIG_ACTIONS.REPLACE_NETWORK_CONFIG,
				data: data.data.networkConfig
			});
			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'Network Config Updated Updated'
			});
		})
		.catch(err => errorHandler(err));

const saveNetworkWideRules = ({ rule, ruleIndex }, dataForAuditLogs) => dispatch => {
	const updaterFn = typeof ruleIndex === 'number' ? service.updateHbRule : service.saveHbRule;

	return updaterFn({ rule, ruleIndex }, dataForAuditLogs)
		.then(({ data: rules }) => {
			dispatch({ type: NETWORK_WIDE_RULES_ACTIONS.UPDATE_NETWORK_WIDE_RULES, rules });
		})
		.catch(error => {
			const { response } = error;
			if (response) {
				const {
					data: { error: err }
				} = response;
				const message = Array.isArray(err)
					? err.map(({ message: msg }) => msg).join(' and ')
					: 'Something went wrong!';

				throw new Error(message);
			}
			// pass the error
			throw new Error(error.message);
		});
};

export {
	fetchGlobalData,
	updateNetworkConfig,
	updateGlobalReportMetaData,
	updateAccountReportMetaData,
	updateGlobalURLReportsMetaData,
	updateGlobalHBAnalyticMetaData,
	saveNetworkWideRules
};
