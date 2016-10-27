import { status } from 'consts/commonConsts';
import { masterSave } from 'libs/dataSyncService';
import { getFinalJson } from 'selectors/siteSelectors';
import _ from 'lodash';
import $ from 'jquery';

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

		const paramData = getFinalJson(_.cloneDeep(getState())),
			doAsyncSave = () => {
				const dfd = $.Deferred();

				return masterSave(paramData)
					.done((data) => {
						dispatch({
							type: status.text.SUCCESS
						});
						return dfd.resolve(data);
					})
					.fail((jqXHR, textStatus) => {
						dispatch({
							type: status.text.FAILED
						});
						return dfd.reject(textStatus);
					});
			};

		$.when(doAsyncSave()).then((data) => {
			// console.log('Data Saved successfully...');
		}, (jqXHR) => {
			// console.log('Error while saving data...');
		}, (status) => {
			// console.log('In Progress state...');
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
