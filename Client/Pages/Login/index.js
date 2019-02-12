import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import history from '../../helpers/history';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import CustomButton from '../../Components/CustomButton';
import { loginAction } from '../../actions/userActions';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';

class Login extends Component {
	state = {
		email: { value: '', error: '' },
		password: { value: '', error: '' }
	};

	onChange = e => {
		const { name, value } = e.target;

		this.setState(state => ({ [name]: { ...state[name], value } }));
	};

	onInputBlur = e => {
		const { name, value } = e.target;
		formValidator
			.validate({ [name]: value }, validationSchema.user.validations)
			.then(() =>
				this.setState(state => ({
					[name]: { ...state[name], error: '' }
				}))
			)
			.catch(err => {
				this.setState(state => ({
					[name]: { ...state[name], error: err[name] }
				}));
			});
	};

	onSubmit = e => {
		e.preventDefault();

		const {
			email: { value: email },
			password: { value: password }
		} = this.state;

		formValidator
			.validate({ email, password }, validationSchema.user.validations)
			.then(() => {
				const { loginAction: login } = this.props;

				login(email, password)
					.then(resp => history.push('/dashboard'))
					.catch(err => console.dir(err.response));
			})
			.catch(err => {
				this.setState(state => {
					const errorKeys = Object.keys(err);
					const newState = {};
					for (let i = 0; i < errorKeys.length; i += 1) {
						newState[errorKeys[i]] = {
							...state[errorKeys[i]],
							error: err[errorKeys[i]]
						};
					}
					return newState;
				});
			});
	};

	render() {
		const {
			email: { error: emailError },
			password: { error: passwordError }
		} = this.state;
		return (
			<AuthShell>
				<AuthFormWrap formType="login" onSubmit={this.onSubmit}>
					<div className="AuthForm LoginForm u-padding-h4 u-padding-v3">
						<FormInput
							type="email"
							name="email"
							onChange={this.onChange}
							onBlur={this.onInputBlur}
							icon="envelope"
						/>
						{emailError}
						<FormInput type="password" name="password" onChange={this.onChange} icon="key" />
						{passwordError}
						<div className="form-group">
							<CustomButton
								variant="primary"
								type="submit"
								id="login-submit"
								className="btn-lightBg btn-red pull-right"
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
				</AuthFormWrap>
			</AuthShell>
		);
	}
}

export default connect(
	null,
	{ loginAction }
)(Login);
