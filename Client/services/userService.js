import authService from './authService';
import axiosInstance from '../helpers/axiosInstance';

export default {
	login: (email, password) => axiosInstance.post('/login', { email, password }),
	signup: user => axiosInstance.post('/signup', user),
	logout: () => authService.removeAuthToken()
};
