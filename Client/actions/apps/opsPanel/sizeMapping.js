import axiosInstance from '../../../helpers/axiosInstance';

const updateSizeMapping = (siteId, data, dataForAuditLogs) => dispatch =>
	axiosInstance.post(`/site/${siteId}/sizeMapping`, { data, dataForAuditLogs });

// eslint-disable-next-line import/prefer-default-export
export { updateSizeMapping };
