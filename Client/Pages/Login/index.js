import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import history from '../../helpers/history';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import CustomButton from '../../Components/CustomButton';
import { loginAction, logoutAction } from '../../actions/userActions';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';

class Login extends Component {
	state = {
		email: { value: '', error: '' },
		password: { value: '', error: '' },
		error: '',
		isLoggingIn: false
	};

	componentDidMount() {
		const { logoutAction } = this.props;

		logoutAction();
	}

	onChange = e => {
		const { name, value } = e.target;

		this.setState(state => ({ [name]: { ...state[name], value } }));
	};

	onInputBlur = e => {
		const { name, value } = e.target;

		const validationResult = formValidator.validate(
			{ [name]: value },
			validationSchema.user.validations
		);

		if (validationResult.isValid) {
			this.setState(state => ({
				[name]: { ...state[name], error: '' }
			}));
		} else {
			this.setState(state => ({
				[name]: { ...state[name], error: validationResult.errors[name] }
			}));
		}
	};

	onSubmit = e => {
		e.preventDefault();

		const {
			email: { value: email },
			password: { value: password }
		} = this.state;

		const validationResult = formValidator.validate(
			{ email, password },
			validationSchema.user.validations
		);

		const validationErrors = { ...validationResult.errors };

		if (validationResult.isValid) {
			this.setState({ isLoggingIn: true });

			const { loginAction: login } = this.props;

			login(email, password)
				.then(resp => history.push('/dashboard'))
				.catch(({ response }) => {
					let newState = { isLoggingIn: false };

					if (response.status === 401) {
						newState = { ...newState, error: response.data.error };
					}

					if (response.status === 400) {
						const errors = response.data.errors.reduce((accumulator, currValue) => ({
							...accumulator,
							...currValue
						}));
						const errorKeys = Object.keys(errors);

						for (let i = 0; i < errorKeys.length; i += 1) {
							newState[errorKeys[i]] = {
								...this.state[errorKeys[i]],
								error: errors[errorKeys[i]]
							};
						}
					}

					this.setState(newState);
				});
		}

		if (Object.keys(validationErrors).length) {
			this.setState(state => {
				const errorKeys = Object.keys(validationResult.errors);
				const newState = {};
				for (let i = 0; i < errorKeys.length; i += 1) {
					newState[errorKeys[i]] = {
						...state[errorKeys[i]],
						error: validationResult.errors[errorKeys[i]]
					};
				}
				return newState;
			});
		}
	};

	render() {
		const {
			email: { error: emailError },
			password: { error: passwordError },
			error,
			isLoggingIn
		} = this.state;
		return (
			<Fragment>
				<Helmet>
					<title>Login</title>
				</Helmet>

				<AuthShell>
					<AuthFormWrap formType="login" onSubmit={this.onSubmit}>
						<Fragment>
							{error && <div className="error-message top">{error}</div>}
							<div className="AuthForm LoginForm u-padding-h4 u-padding-v3">
								<FormInput
									type="email"
									name="email"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="envelope"
								/>
								{emailError && <div className="error-message">{emailError}</div>}
								<FormInput
									type="password"
									name="password"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="key"
								/>
								{passwordError && <div className="error-message">{passwordError}</div>}
								<div className="form-group">
									<CustomButton
										variant="primary"
										showSpinner={isLoggingIn}
										type="submit"
										id="login-submit"
										className="pull-right"
									>
										Login
									</CustomButton>
									<Link
										to="/forgot-password"
										id="login-forgotPassword-redirect-link"
										className="forgetPassword"
									>
										Forgot Password?
									</Link>
								</div>
							</div>
							<div className="AuthFooter LoginFooter row">
								<div className="pull-right">
									Don&apos;t have an account?
									<Link to="/signup" id="auth-signup-redirect-link" className="btn btn--secondary">
										Sign up
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
	{ loginAction, logoutAction }
)(Login);
