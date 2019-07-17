import axiosInstance from '../helpers/axiosInstance';

export default {
	sendCodeByEmail: (developerEmail, subject, encodedEmailBody) =>
		axiosInstance.post('/data/sendCode', { developerEmail, subject, emailBody: encodedEmailBody })
};
