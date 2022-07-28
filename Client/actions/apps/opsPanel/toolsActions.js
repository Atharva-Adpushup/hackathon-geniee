import axiosInstance from '../../../helpers/axiosInstance';
import { TOOLS_ACTIONS, UI_ACTIONS } from '../../../constants/global';

export const fetchInventoryTabAllAdUnits = () => dispatch => {
	axiosInstance.get('ops/getAdUnitMapping').then(response => {
		const {
			data: { data: adUnitData = [] }
		} = response;
		dispatch({
			type: TOOLS_ACTIONS.REPLACE_TOOLS_INVENTORY_AD_UNITS_DATA,
			data: adUnitData
		});
	});
};

export const updateInventoryTabAdUnits = ({
	seggragatedAds,
	adUnitLevelAction,
	dataForAuditLogs,
	adUnitSizeActions
}) => dispatch => {
	dispatch({
		type: TOOLS_ACTIONS.UPDATE_TOOLS_INVENTORY_AD_UNITS_DATA_STARTED
	});
	axiosInstance.post('ops/updateInventories', { seggragatedAds, dataForAuditLogs }).then(() => {
		dispatch({
			type: TOOLS_ACTIONS.UPDATE_TOOLS_INVENTORY_AD_UNITS_DATA_COMPLETED,
			adUnitLevelAction,
			adUnitSizeActions
		});
		dispatch({
			type: UI_ACTIONS.SHOW_NOTIFICATION,
			mode: 'success',
			title: 'Success',
			message: `All Inventories updated successfully`,
			autoDismiss: 5
		});
	});
};
