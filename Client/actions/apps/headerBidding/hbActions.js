/* eslint-disable import/prefer-default-export */
import { CHECK_INVENTORY } from '../../../constants/headerBidding';
import axiosInstance from '../../../helpers/axiosInstance';

export const checkInventoryAction = siteId => dispatch => {
	axiosInstance
		.get(`/headerBidding/isInventoryExist/${siteId}`)
		.then(() => dispatch({ type: CHECK_INVENTORY, inventoryFound: true }))
		.catch(() => {
			dispatch({ type: CHECK_INVENTORY, inventoryFound: false });
		});
};
