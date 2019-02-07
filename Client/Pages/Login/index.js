import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import history from '../../helpers/history';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import axiosInstance from '../../helpers/axiosInstance';
import ApButton from '../../Components/ApButton';

class Login extends Component {
	state = {
		email: '',
		password: ''
	};

	onChange = e => {
		const { name, value } = e.target;
		this.setState({
			[name]: value
		});
	};

	onSubmit = e => {
		e.preventDefault();

		const { email, password } = this.state;
		axiosInstance
			.post('/login', { email, password })
			.then(resp => history.push('/dashboard'))
			.catch(err => console.dir(err.response));
	};

	render() {
		return (
			<AuthShell>
				<AuthFormWrap formType="login" onSubmit={this.onSubmit}>
					<Fragment>
						<FormInput type="email" name="email" onChange={this.onChange} icon="envelope" />
						<FormInput type="password" name="password" onChange={this.onChange} icon="key" />
						<div className="form-group">
							<ApButton
								variant="primary"
								type="submit"
								id="login-submit"
								className="btn-lightBg btn-red pull-right"
							>
								Login
							</ApButton>
							<Link
								to="/forgot-password"
								id="login-forgotPassword-redirect-link"
								className="forgetPassword"
							>
								Forgot Password?
							</Link>
						</div>
					</Fragment>
				</AuthFormWrap>
			</AuthShell>
		);
	}
}

export default Login;
