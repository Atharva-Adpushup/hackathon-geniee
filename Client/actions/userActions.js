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
export const forgotPasswordAction = email => dispatch => userService.forgotPassword(email);
export const resetPasswordAction = (email, key, password) => dispatch =>
	userService.resetPassword(email, key, password);
export const paymentsAction = () => dispatch => userService.payments();
