import { status } from 'consts/commonConsts';
import { masterSave } from 'libs/dataSyncService';
import _ from 'lodash';

const afterSaveLoaderStatusPending = (loaderStatus) => {
		return {
			type: status.text.PENDING,
			loaderStatus
		};
	},
	masterSaveData = () => (dispatch, getState) => {
		dispatch({
			type: status.text.PENDING
		});

		let originalState = getState(),
			paramData = {};

		return new Promise((resolve, reject) => {
			return masterSave(paramData)
			.done((data) => {
				dispatch({
					type: status.text.SUCCESS
				});
				return resolve(data);
			})
			.fail((jqXHR, textStatus) => {
				dispatch({
					type: status.text.FAILED
				});
				// return reject(textStatus);
			});
		});
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
	},
	afterSaveLoaderStatusReset = () => {
		return {
			type: status.text.RESET
		}
	};

export { afterSaveLoaderStatusReset, afterSaveLoaderStatusPending, masterSaveData, afterSaveLoaderStatusSuccess, afterSaveLoaderStatusFailed }
