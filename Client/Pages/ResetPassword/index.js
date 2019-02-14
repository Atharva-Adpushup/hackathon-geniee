import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import ApButton from '../../Components/ApButton';
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
		error: ''
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
		let validationErrors = {
			...validationResult.errors,
			...(password !== confirmPassword
				? { confirmPassword: 'Password and Confirm password should match.' }
				: {})
		};

		if (!Object.keys(validationErrors).length) {
			const { resetPasswordAction: resetPassword } = this.props;

			resetPassword(email, key, password)
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
					if (response.status === 400) {
						console.dir(response);
						if (response.data.error) {
							return this.setState({ error: response.data.error });
						}
						validationErrors = {
							...validationErrors,
							...response.data.errors.reduce((accumulator, currValue) => ({
								...accumulator,
								...currValue
							}))
						};
					}
					if (response.status === 404) return this.setState({ error: response.data.error });
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
			error
		} = this.state;
		return (
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
							{confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
						</div>

						<div className="AuthFooter ForgotPswFooter row">
							<div className="col-xs-6">
								<ApButton type="submit" id="forgotPassword-submit" variant="secondary">
									Reset Password
								</ApButton>
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
		);
	}
}

export default connect(
	null,
	{ resetPasswordAction }
)(ResetPassword);
