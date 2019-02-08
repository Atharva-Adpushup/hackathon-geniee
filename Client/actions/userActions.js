import userService from '../services/userService';
import history from '../helpers/history';

export const loginAction = (email, password) => dispatch => userService.login(email, password);
export const signupAction = user => dispatch => userService.signup(user);
export const logoutAction = () => dispatch =>
	userService
		.logout()
		.then(() => {
			history.push('/login');
		})
		.catch(() => {
			// TODO: handle logout failure
			console.log('unable to logout');
		});
