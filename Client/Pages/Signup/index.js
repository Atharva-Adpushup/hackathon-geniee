import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import history from '../../helpers/history';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import CustomButton from '../../Components/CustomButton';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';
import { signupAction } from '../../actions/userActions';

class Signup extends Component {
	state = {
		name: { value: '', error: '' },
		site: { value: '', error: '' },
		email: { value: '', error: '' },
		password: { value: '', error: '' },
		websiteRevenue: '200001'
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
			name: { value: name },
			email: { value: email },
			password: { value: password },
			site: { value: site },
			websiteRevenue
		} = this.state;

		formValidator
			.validate({ name, email, password, site }, validationSchema.user.validations)
			.then(() => {
				const { signupAction: signup } = this.props;

				signup({ name, email, password, site, websiteRevenue })
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
			name: { error: nameError },
			site: { error: siteError },
			email: { error: emailError },
			password: { error: passwordError },
			websiteRevenue
		} = this.state;

		return (
			<AuthShell>
				<AuthFormWrap formType="signup" onSubmit={this.onSubmit}>
					<Fragment>
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
									<CustomButton
										variant="primary"
										type="submit"
										id="signup-submit"
										className="u-margin-0px btn btn-lightBg btn-red pull-right"
									>
										Create an account
									</CustomButton>
								</div>
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
	{ signupAction }
)(Signup);
