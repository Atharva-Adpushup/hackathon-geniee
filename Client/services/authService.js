import Cookies from 'universal-cookie';
import jwt from 'jsonwebtoken';

const cookies = new Cookies();
const authCookieName = 'user';

export default {
	getAuthToken: () => cookies.get(authCookieName).authToken,
	removeAuthToken: () => {
		cookies.remove(authCookieName, {
			path: '/'
		});
		if (!cookies.get(authCookieName)) {
			return Promise.resolve();
		}
		return Promise.reject();
	},
	isLoggedin: () => !!cookies.get(authCookieName),
	isOps: () => {
		const authCookie = cookies.get(authCookieName);
		return !!authCookie && authCookie.isSuperUser;
	},
	getTokenPayloadWithoutVerification() {
		const token = this.getAuthToken();
		return jwt.decode(token);
	}
};
