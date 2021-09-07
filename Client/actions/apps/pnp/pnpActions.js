import { UPDATE_PNP_CONFIG, UPDATE_PNP_CONFIG_KEY } from '../../../constants/pnp';

const updatePnpConfig = (siteId, config) => dispatch => {
	dispatch({ type: UPDATE_PNP_CONFIG, siteId, payload: config });
};

const updatePnpConfigKey = (siteId, key, value) => dispatch => {
	dispatch({ type: UPDATE_PNP_CONFIG_KEY, siteId, payload: { key, value } });
};

export { updatePnpConfig, updatePnpConfigKey };