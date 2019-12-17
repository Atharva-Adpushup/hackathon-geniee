import authService from './authService';
import axiosInstance from '../helpers/axiosInstance';

export default {
	login: (email, password) => axiosInstance.post('/login', { email, password }),
	signup: user => axiosInstance.post('/signup', user),
	logout: () => authService.removeAuthToken(),
	switchUser: email => axiosInstance.post('/user/switchUser', { email }),
	findUsers: () => axiosInstance.get('/user/findUsers'),
	forgotPassword: email => axiosInstance.post('/forgotPassword', { email }),
	resetPassword: (email, key, password) =>
		axiosInstance.post('/resetPassword', { email, key, password }),
	addSite: site => axiosInstance.post('/user/addSite', { site }),
	payments: () => axiosInstance.get('/user/payment'),
	setSiteStep: (siteId, onboardingStage, step) =>
		axiosInstance.post('/user/setSiteStep', { siteId, onboardingStage, step })
};