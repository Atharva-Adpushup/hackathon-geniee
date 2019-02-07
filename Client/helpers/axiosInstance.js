import axios from 'axios';
import config from '../config/config';

const axiosInstance = axios.create({
	baseURL: config.API_ROOT,
	withCredentials: true
});

export default axiosInstance;
