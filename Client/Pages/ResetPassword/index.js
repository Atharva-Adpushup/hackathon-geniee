import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import CustomButton from '../../Components/CustomButton';
import { resetPasswordAction } from '../../actions/userActions';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';
import history from '../../helpers/history';

class ResetPassword extends Component {
	state = {
		email: '',
		key: '',
		password: { value: '', error: '' },
		confirmPassword: { value: '', error: '' },
		success: '',
		error: '',
		isResettingPassword: false
	};

	static getDerivedStateFromProps({ location }) {
		const queryParams = new URLSearchParams(location.search);
		const email = queryParams.get('email');
		const key = queryParams.get('key');

		let newState = null;

		const validationResult = formValidator.validate(
			{ email, key },
			validationSchema.user.validations
		);

		if (validationResult.isValid) {
			newState = { email, key };
		} else {
			history.push('/');
		}

		return newState;
	}

	onChange = e => {
		const { name, value } = e.target;

		this.setState(state => ({ [name]: { ...state[name], value } }));
	};

	// eslint-disable-next-line consistent-return
	onInputBlur = e => {
		const { name, value } = e.target;

		const {
			[name]: { error: existingError }
		} = this.state;

		const {
			password: { value: password },
			confirmPassword: { value: confirmPassword }
		} = this.state;

		const validationResult = formValidator.validate(
			{ [name]: value },
			validationSchema.user.validations
		);

		// password missmatch
		if (validationResult.isValid && name === 'confirmPassword' && password !== confirmPassword) {
			return this.setState(state => ({
				confirmPassword: {
					...state.confirmPassword,
					error: 'Password and Confirm password should match.'
				}
			}));
		}

		// reset error
		if (validationResult.isValid && existingError) {
			return this.setState(state => ({
				[name]: { ...state[name], error: '' }
			}));
		}

		if (!validationResult.isValid) {
			this.setState(state => ({
				[name]: { ...state[name], error: validationResult.errors[name] }
			}));
		}
	};

	onSubmit = e => {
		e.preventDefault();

		const {
			email,
			key,
			password: { value: password },
			confirmPassword: { value: confirmPassword }
		} = this.state;

		const validationResult = formValidator.validate(
			{ password },
			validationSchema.user.validations
		);
		const validationErrors = {
			...validationResult.errors,
			...(password !== confirmPassword
				? { confirmPassword: 'Password and Confirm password should match.' }
				: {})
		};

		if (!Object.keys(validationErrors).length) {
			this.setState({ isResettingPassword: true });

			const { resetPasswordAction: resetPassword } = this.props;

			resetPassword(email, key, password)
				// eslint-disable-next-line no-unused-vars
				.then(resp => {
					this.setState(
						() => ({
							success: 'Password has been reset successfully. Redirecting to login page...'
						}),
						() =>
							setTimeout(() => {
								history.push('/login');
							}, 3000)
					);
				})
				.catch(({ response }) => {
					const newState = { isResettingPassword: false };

					// eslint-disable-next-line no-prototype-builtins
					if (response.status === 400 && response.data.hasOwnProperty('errors')) {
						const errors = response.data.errors.reduce((accumulator, currValue) => ({
							...accumulator,
							...currValue
						}));
						const errorKeys = Object.keys(errors);

						for (let i = 0; i < errorKeys.length; i += 1) {
							newState[errorKeys[i]] = {
								// eslint-disable-next-line react/destructuring-assignment
								...this.state[errorKeys[i]],
								error: errors[errorKeys[i]]
							};
						}
					}
					// eslint-disable-next-line no-prototype-builtins
					if (response.data.hasOwnProperty('error')) newState.error = response.data.error;

					this.setState(newState);
				});
		}

		if (Object.keys(validationErrors).length) {
			this.setState(state => {
				const errorKeys = Object.keys(validationErrors);
				const newState = {};
				for (let i = 0; i < errorKeys.length; i += 1) {
					newState[errorKeys[i]] = {
						...state[errorKeys[i]],
						error: validationErrors[errorKeys[i]]
					};
				}
				return newState;
			});
		}
	};

	render() {
		const {
			password: { error: passwordError },
			confirmPassword: { error: confirmPasswordError },
			success,
			error,
			isResettingPassword
		} = this.state;
		return (
			<Fragment>
				<DocumentTitle title="Reset Password" />

				<AuthShell>
					<AuthFormWrap formType="resetPassword" onSubmit={this.onSubmit}>
						<Fragment>
							{success && <div className="success-message top">{success}</div>}
							{error && <div className="error-message top">{error}</div>}

							<div className="AuthForm ResetPasswordForm u-padding-h4 u-padding-v3">
								<FormInput
									type="password"
									name="password"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="envelope"
									placeholder="New Password"
								/>
								{passwordError && <div className="error-message">{passwordError}</div>}

								<FormInput
									type="password"
									name="confirmPassword"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="envelope"
									placeholder="Confirm Password"
								/>
								{confirmPasswordError && (
									<div className="error-message">{confirmPasswordError}</div>
								)}
							</div>

							<div className="AuthFooter ForgotPswFooter row">
								<div className="col-xs-6">
									<CustomButton
										type="submit"
										showSpinner={isResettingPassword}
										id="forgotPassword-submit"
										variant="secondary"
									>
										Reset Password
									</CustomButton>
								</div>
								<div className="col-xs-6">
									<Link
										to="/login"
										id="forgotPassword-auth-redirect-link"
										className="btn btn--secondary"
									>
										Or, Go Back
									</Link>
								</div>
							</div>
						</Fragment>
					</AuthFormWrap>
				</AuthShell>
			</Fragment>
		);
	}
}

export default connect(
	null,
	{ resetPasswordAction }
)(ResetPassword);
