import axiosInstance from '../helpers/axiosInstance';
import config from '../config/config';
import { REPORTS_ACTIONS } from '../constants/global';

export default {
	getCustomStats: params => {
		const url = config.ANALYTICS_API_CUSTOM_DATA;
		return axiosInstance.get(url, { params });
	},
	getAPStatsByCustom: params => {
		const url = config.ANALYTICS_API_AP_STATS_BY_CUSTOM_DATA;
		return axiosInstance.get(url, { params });
	},
	getWidgetData: params => {
		const url = config.ANALYTICS_API_WIDGET_DATA;
		return axiosInstance.get(url, { params });
	},
	getLastUpdateStatus: params => {
		const url = config.ANALYTICS_API_UPDATE_STATUS;
		return axiosInstance.get(url, { params });
	},
	getMetaData: params => axiosInstance.get('/reports/getMetaData', { params }),
	getSavedAndFrequentReports: () => axiosInstance.get('/reports'),
	saveReportConfig: reportConfig => axiosInstance.post('/reports', reportConfig),
	deleteSavedReport: reportId => axiosInstance.delete(`reports/${reportId}`),
	updateSavedAndFrequentReports: reportConfig =>
		axiosInstance.patch(`/reports/${reportConfig.id}`, reportConfig),
	getCorewebVitalsdata: params => axiosInstance.get('/reports/getCoreWebVitals', { params }),
	getPaymentHistory: params => axiosInstance.get('/reports/getPaymentHistory', { params }),
	getReportingDataInGoogleSheet: csvData =>
		axiosInstance.post('/reports/exportDataToGoogleSheet', { csvData })
};
