import authService from './authService';
import axiosInstance from '../helpers/axiosInstance';

export default {
	login: (email, password) => axiosInstance.post('/login', { email, password }),
	signup: user => axiosInstance.post('/signup', user),
	logout: () => authService.removeAuthToken(),
	switchUser: email => axiosInstance.post('/user/switchUser', { email }),
	impersonateCurrentUser: () => axiosInstance.post('/user/impersonateCurrentUser'),
	findUsers: options => axiosInstance.get('/user/findUsers', { params: options }),
	forgotPassword: email => axiosInstance.post('/forgotPassword', { email }),
	resetPassword: (email, key, password) =>
		axiosInstance.post('/resetPassword', { email, key, password }),
	addSite: (site, dataForAuditLogs) =>
		axiosInstance.post('/user/addSite', { site, dataForAuditLogs }),
	payments: () => axiosInstance.get('/user/payment'),
	// eslint-disable-next-line max-params
	setSiteStep: (siteId, onboardingStage, step, dataForAuditLogs) =>
		axiosInstance.post('/user/setSiteStep', { siteId, onboardingStage, step, dataForAuditLogs }),
	skipOauthInGoogleAccountIntegration: () => axiosInstance.get('/user/skipOauth2WithRefreshToken')
};
