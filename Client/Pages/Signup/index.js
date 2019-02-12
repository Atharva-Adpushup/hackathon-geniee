import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import history from '../../helpers/history';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import ApButton from '../../Components/ApButton';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';
import { signupAction } from '../../actions/userActions';

class Signup extends Component {
	state = {
		name: { value: '', error: '' },
		site: { value: '', error: '' },
		email: { value: '', error: '' },
		password: { value: '', error: '' },
		websiteRevenue: '200001',
		termsPolicy: { accepted: false, error: '' }
	};

	onChange = e => {
		const { name, value } = e.target;

		this.setState(state => ({ [name]: { ...state[name], value } }));
	};

	onCheckboxToggle = e => {
		const { name, checked } = e.target;
		this.setState(state => ({ [name]: { ...state[name], accepted: checked } }));
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
			name: { value: name },
			email: { value: email },
			password: { value: password },
			site: { value: site },
			websiteRevenue,
			termsPolicy
		} = this.state;

		formValidator
			.validate({ name, email, password, site }, validationSchema.user.validations)
			.then(() =>
				!termsPolicy.accepted
					? Promise.reject({ termsPolicy: 'Please agree to our Terms of Service & Privacy Policy' })
					: null
			)
			.then(() => {
				const { signupAction: signup } = this.props;

				signup({ name, email, password, site, websiteRevenue })
					.then(resp => history.push('/dashboard'))
					.catch(err => console.dir(err.response));
			})
			.catch(err => {
				const error = { ...err };

				if (!err.termsPolicy && !termsPolicy.accepted) {
					error.termsPolicy = 'Please agree to our Terms of Service & Privacy Policy';
				}

				this.setState(state => {
					const errorKeys = Object.keys(error);
					const newState = {};
					for (let i = 0; i < errorKeys.length; i += 1) {
						newState[errorKeys[i]] = {
							...state[errorKeys[i]],
							error: error[errorKeys[i]]
						};
					}

					if (state.termsPolicy.accepted && state.termsPolicy.error)
						newState.termsPolicy = { error: '' };

					return newState;
				});
			});
	};

	render() {
		const {
			name: { error: nameError },
			site: { error: siteError },
			email: { error: emailError },
			password: { error: passwordError },
			websiteRevenue,
			termsPolicy
		} = this.state;

		return (
			<AuthShell>
				<AuthFormWrap formType="signup" onSubmit={this.onSubmit}>
					<div className="AuthForm SignupForm u-padding-h4 u-padding-v3">
						<Row>
							<Col md={6}>
								<FormInput
									type="text"
									name="name"
									placeholder="Name"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="user"
								/>
								{nameError}
							</Col>
							<Col md={6}>
								<FormInput
									type="url"
									name="site"
									placeholder="Website"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="link"
								/>
								{siteError}
							</Col>
						</Row>

						<Row>
							<Col md={6}>
								<FormInput
									type="email"
									name="email"
									placeholder="Email"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="envelope"
								/>
								{emailError}
							</Col>
							<Col md={6}>
								<FormInput
									type="password"
									name="password"
									placeholder="password"
									onChange={this.onChange}
									onBlur={this.onInputBlur}
									icon="key"
								/>
								{passwordError}
							</Col>
						</Row>

						<Row>
							<Col md={12}>
								<FormInput
									type="text"
									name="websiteRevenue"
									placeholder="Website Revenue"
									onChange={this.onChange}
									icon="dollar-sign"
									value={websiteRevenue}
								/>
							</Col>
						</Row>

						<div className="form-group clearfix">
							<div className="col-md-12 u-padding-0">
								<div className="col-md-6 u-padding-0">
									<div className="input-group input-group--minimal">
										<span className="input-group-addon signup-termsPolicy-wrap">
											<input
												type="checkbox"
												id="signup-termsPolicy"
												name="termsPolicy"
												onChange={this.onCheckboxToggle}
											/>
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
									{termsPolicy.error && (
										<div className="error-message js-error-message js-termsPolicy-error">
											{termsPolicy.error}
										</div>
									)}
								</div>

								<div className="col-md-6 u-padding-0">
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
					</div>
				</AuthFormWrap>
			</AuthShell>
		);
	}
}

export default connect(
	null,
	{ signupAction }
)(Signup);
