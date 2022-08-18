/* eslint-disable no-param-reassign */
import { TOOLS_ACTIONS } from '../../constants/global';

const DEFAULT_STATE = {
	inventoryAdUnits: {
		data: [],
		fetched: false
	}
};

const tools = (state = DEFAULT_STATE, action) => {
	switch (action.type) {
		case TOOLS_ACTIONS.REPLACE_TOOLS_INVENTORY_AD_UNITS_DATA: {
			let { data } = action;
			data = data.map(ad => ({ ...ad, adUnitSettings: true, adUnitAction: true }));
			return {
				...state,
				inventoryAdUnits: {
					data,
					fetched: true
				}
			};
		}
		case TOOLS_ACTIONS.UPDATE_TOOLS_INVENTORY_AD_UNITS_DATA_STARTED: {
			const { inventoryAdUnits } = state;
			return {
				...state,
				inventoryAdUnits: {
					...inventoryAdUnits,
					fetched: false
				}
			};
		}
		case TOOLS_ACTIONS.UPDATE_TOOLS_INVENTORY_AD_UNITS_DATA_COMPLETED: {
			const { adUnitLevelAction, adUnitSizeActions } = action;
			let {
				inventoryAdUnits: { data: oldAdUnitsData }
			} = state;

			oldAdUnitsData = oldAdUnitsData.map(ad => {
				const { adId } = ad;
				if (adUnitLevelAction[adId]) {
					const value = adUnitLevelAction[adId];
					let actionValue = null;
					let enable = null;
					if (value) {
						if (value.includes('enable-')) {
							actionValue = value.replace('enable-', '');
							enable = true;
						} else {
							actionValue = value.replace('disable-', '');
							if (actionValue === 'downwardSizesDisabled') {
								const sizeFilters = adUnitSizeActions[adId] || {};
								ad.sizeFilters = { ...sizeFilters };
							}
							enable = false;
						}
						return { ...ad, [actionValue]: enable };
					}
				}
				return ad;
			});
			return {
				...state,
				inventoryAdUnits: {
					data: oldAdUnitsData,
					fetched: true
				}
			};
		}
		default:
			return state;
	}
};

export default tools;
