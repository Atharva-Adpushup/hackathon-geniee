/* eslint-disable no-console */
/* eslint-disable no-alert */
import userService from '../services/userService';
import history from '../helpers/history';
import { USER_ACTIONS, UI_ACTIONS } from '../constants/global';
import axiosInstance from '../helpers/axiosInstance';
import { errorHandler } from '../helpers/commonFunctions';

export const loginAction = (email, password) => () =>
	userService.login(email, password).then(response => {
		window.cookieProcessing();
		return response;
	});
export const findUsers = () => () => userService.findUsers();
export const switchUser = email => dispatch =>
	userService
		.switchUser(email)
		.then(() => {
			dispatch({
				type: USER_ACTIONS.RESET_STATE
			});
			return true;
		})
		.catch(() => window.alert('User Switch Failed'));
export const impersonateCurrentUser = () => dispatch =>
	userService
		.impersonateCurrentUser()
		.then(() => {
			dispatch({
				type: USER_ACTIONS.RESET_STATE
			});
			return true;
		})
		.catch(() => window.alert('User Impersonate Failed'));
export const signupAction = user => () =>
	userService.signup(user).then(response => {
		window.cookieProcessing();
		return response;
	});
export const logout = () => dispatch =>
	userService
		.logout()
		.then(() => {
			window.resetCookieValues();
			dispatch({
				type: USER_ACTIONS.LOGOUT_USER
			});
			history.push('/login');
		})
		.catch(() => {
			// TODO: handle logout failure
			console.log('unable to logout');
		});
export const forgotPasswordAction = email => () => userService.forgotPassword(email);
export const resetPasswordAction = (email, key, password) => () =>
	userService.resetPassword(email, key, password);
export const paymentsAction = () => () => userService.payments();
export const updateAdNetworkSettingsAction = data => dispatch =>
	dispatch({
		type: USER_ACTIONS.UPDATE_AD_NETWORK_SETTINGS,
		data
	});
export const overrideOpsPanelUniqueImpValue = data => dispatch => {
	dispatch({
		type: USER_ACTIONS.OVERRIDE_OPS_PANEL_VALUE,
		data
	});
};

export const updateUser = (params, dataForAuditLogs) => dispatch =>
	axiosInstance
		.post('/user/updateUser', { toUpdate: params, dataForAuditLogs })
		.then(response => {
			const {
				data: {
					data: { toUpdate = [] }
				}
			} = response;

			toUpdate.forEach(content => {
				dispatch({
					type: USER_ACTIONS.UPDATE_USER,
					data: { key: content.key, value: content.value }
				});
			});

			return dispatch({
				type: UI_ACTIONS.SHOW_NOTIFICATION,
				mode: 'success',
				title: 'Operation Successful',
				autoDismiss: 5,
				message: 'User Updated'
			});
		})
		.catch(err => errorHandler(err));
