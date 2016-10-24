import { status } from 'consts/commonConsts';

const afterSaveLoaderStatusPending = (loaderStatus) => {
	return {
		type: status.text.PENDING,
		loaderStatus
	};
},
afterSaveLoaderStatusSuccess = (loaderStatus) => {
	return {
		type: status.text.SUCCESS,
		loaderStatus
	};
},
afterSaveLoaderStatusFailed = (loaderStatus) => {
	return {
		type: status.text.FAILED,
		loaderStatus
	};
};

export { afterSaveLoaderStatusPending, afterSaveLoaderStatusSuccess, afterSaveLoaderStatusFailed }
