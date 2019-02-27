import { SITE_ACTIONS } from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';
import { errorHandler } from '../helpers/commonFunctions';

const fetchAppStatuses = () => dispatch =>
	axiosInstance
		.get('/site/fetchAppStatues')
		.then(response => {
			const { data } = response;
			dispatch({
				type: SITE_ACTIONS.UPDATE_SITE_DATA,
				data: data.sites
			});
		})
		.catch(err => {
			console.log(err);
		});

export { fetchAppStatuses };
