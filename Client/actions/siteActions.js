import { SITE_ACTIONS } from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';
import { errorHandler } from '../helpers/commonFunctions';

const fetchAppStatuses = siteId => dispatch =>
	axiosInstance
		.get('/site/fetchAppStatuses', { params: { siteId } })
		.then(response => {
			const { data } = response.data;
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA,
				data
			});
		})
		.catch(err => errorHandler(err));

const addNewSite = siteObj => dispatch =>
	dispatch({
		type: SITE_ACTIONS.UPDATE_SITE_DATA,
		data: siteObj
	});

const updateSiteStep = (siteId, step, onboardingStage) => dispatch =>
	dispatch({
		type: SITE_ACTIONS.UPDATE_SITE_STEP,
		data: { siteId, step, onboardingStage }
	});

const updateApConfig = (siteId, apConfigs) => dispatch =>
	dispatch({
		type: SITE_ACTIONS.UPDATE_SITE_APCONFIG,
		data: { siteId, apConfigs }
	});

export { fetchAppStatuses, addNewSite, updateSiteStep, updateApConfig };
