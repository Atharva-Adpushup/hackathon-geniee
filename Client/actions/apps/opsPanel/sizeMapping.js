import axiosInstance from '../../../helpers/axiosInstance';

const updateSizeMapping = (siteId, data) => dispatch =>
	axiosInstance.post(`/site/${siteId}/sizeMapping`, data);

// eslint-disable-next-line import/prefer-default-export
export { updateSizeMapping };
