import Cookies from 'universal-cookie';

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
	}
};
