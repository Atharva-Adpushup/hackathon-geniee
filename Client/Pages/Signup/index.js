import React, { Component, Fragment } from 'react';
import history from '../../helpers/history';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import axiosInstance from '../../helpers/axiosInstance';
import ApButton from '../../Components/ApButton';

class Signup extends Component {
	state = {
		name: '',
		site: '',
		email: '',
		password: '',
		websiteRevenue: '200001'
	};

	onChange = e => {
		const { name, value } = e.target;
		this.setState({
			[name]: value
		});
	};

	onSubmit = e => {
		e.preventDefault();

		const { name, email, password, site, websiteRevenue } = this.state;
		axiosInstance
			.post('/signup', { name, email, password, site, websiteRevenue })
			.then(resp => history.push('/dashboard'))
			.catch(err => console.dir(err.response));
	};

	render() {
		const { websiteRevenue } = this.state;

		return (
			<AuthShell>
				<AuthFormWrap formType="signup" onSubmit={this.onSubmit}>
					<Fragment>
						<FormInput
							type="text"
							name="name"
							placeholder="Name"
							onChange={this.onChange}
							icon="user"
						/>
						<FormInput
							type="url"
							name="site"
							placeholder="Website"
							onChange={this.onChange}
							icon="link"
						/>
						<FormInput
							type="email"
							name="email"
							placeholder="Email"
							onChange={this.onChange}
							icon="envelope"
						/>
						<FormInput
							type="password"
							name="password"
							placeholder="password"
							onChange={this.onChange}
							icon="key"
						/>
						<FormInput
							type="text"
							name="websiteRevenue"
							placeholder="Website Revenue"
							onChange={this.onChange}
							icon="dollar-sign"
							value={websiteRevenue}
						/>

						<div className="form-group">
							<div className="col-md-12 pd-0">
								<div className="col-md-6 u-padding-r15px">
									<div className="input-group input-group--minimal">
										<span className="input-group-addon">
											<input type="checkbox" id="signup-termsPolicy" name="termsPolicy" />
										</span>
										<div className="input-group-text">
											I agree to{' '}
											<a target="_blank" href="http://www.adpushup.com/tos.php">
												Terms of Service{' '}
											</a>
											&amp;{' '}
											<a target="_blank" href="http://www.adpushup.com/privacy.php">
												Privacy Policy
											</a>
										</div>
									</div>

									<div className="error-message js-error-message js-termsPolicy-error" />
								</div>

								<div className="col-md-6 pd-0">
									<ApButton
										variant="primary"
										type="submit"
										id="signup-submit"
										className="u-margin-0px btn btn-lightBg btn-red pull-right"
									>
										Create an account
									</ApButton>
								</div>
							</div>
						</div>
					</Fragment>
				</AuthFormWrap>
			</AuthShell>
		);
	}
}

export default Signup;
