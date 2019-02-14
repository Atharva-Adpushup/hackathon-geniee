import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import history from '../../helpers/history';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import ApButton from '../../Components/ApButton';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';
import { signupAction } from '../../actions/userActions';
import SelectBox from '../../Components/Selectbox';

class Signup extends Component {
	state = {
		name: { value: '', error: '' },
		site: { value: '', error: '' },
		email: { value: '', error: '' },
		password: { value: '', error: '' },
		websiteRevenue: { value: '', error: '' },
		termsPolicy: { accepted: false, error: '' },
		error: '',
		isSigningUp: false
	};

	websiteRevenueOptions = [
		{ name: '< 1000', value: '999' },
		{ name: '1000-2500', value: '1000-2500' },
		{ name: '2500-5000', value: '2500-5000' },
		{ name: '5000-10000', value: '5000-10000' },
		{ name: '10000-50000', value: '10000-50000' },
		{ name: '50000-200000', value: '50000-200000' },
		{ name: '200000+', value: '200001' }
	];

	onChange = e => {
		const { name, value } = e.target;

		this.setState(state => ({ [name]: { ...state[name], value } }));
	};

	onCheckboxToggle = e => {
		const { name, checked } = e.target;
		this.setState(state => ({ [name]: { ...state[name], accepted: checked } }));
	};

	onRevenueSelect = selectedValue => {
		this.setState(state => ({
			websiteRevenue: { ...state.websiteRevenue, value: selectedValue }
		}));
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
			name: { value: name },
			email: { value: email },
			password: { value: password },
			site: { value: site },
			websiteRevenue: { value: websiteRevenue },
			termsPolicy
		} = this.state;

		const validationResult = formValidator.validate(
			{ name, email, password, site, websiteRevenue },
			validationSchema.user.validations
		);

		const validationErrors = {
			...validationResult.errors,
			...(!termsPolicy.accepted
				? { termsPolicy: 'Please agree to our Terms of Service & Privacy Policy' }
				: {})
		};

		if (validationResult.isValid && termsPolicy.accepted) {
			this.setState({ isSigningUp: true });

			const { signupAction: signup } = this.props;

			signup({ name, email, password, site, websiteRevenue })
				.then(resp => history.push('/dashboard'))
				.catch(({ response }) => {
					const newState = { isSigningUp: false };

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

					if (response.status === 500) {
						newState.error = response.data.error;
					}

					this.setState(newState);
				});
		}

		const errorKeys = Object.keys(validationErrors);

		if (errorKeys.length) {
			this.setState(state => {
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
			name: { error: nameError },
			site: { error: siteError },
			email: { error: emailError },
			password: { error: passwordError },
			websiteRevenue: { error: websiteRevenueError },
			termsPolicy: { error: termsPolicyError },
			error,
			isSigningUp
		} = this.state;

		return (
			<AuthShell>
				<AuthFormWrap formType="signup" onSubmit={this.onSubmit}>
					<Fragment>
						{error && <div className="error-message top">{error}</div>}
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
									{nameError && <div className="error-message">{nameError}</div>}
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
									{siteError && <div className="error-message">{siteError}</div>}
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
									{emailError && <div className="error-message">{emailError}</div>}
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
									{passwordError && <div className="error-message">{passwordError}</div>}
								</Col>
							</Row>

							<Row>
								<Col md={12}>
									<div className="form-group">
										<SelectBox
											id="websiteRevenue"
											dropdownClassName="form-control websiteRevenue"
											title="Monthly Ad Revenue (in USD)"
											onSelect={this.onRevenueSelect}
											options={this.websiteRevenueOptions}
										/>
										{websiteRevenueError && (
											<div className="error-message">{websiteRevenueError}</div>
										)}
									</div>
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
										{termsPolicyError && <div className="error-message">{termsPolicyError}</div>}
									</div>

									<div className="col-md-6 u-padding-0">
										<ApButton
											variant="primary"
											showSpinner={isSigningUp}
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

						<div className="AuthFooter SignupFooter row text-center">
							<div className="u-margin-b4">
								Already have an account?
								<Link to="/login" id="signup-auth-redirect-btn" className="btn btn--secondary">
									Login!
								</Link>
							</div>
							<span className="u-padding-0 label label--text-faded">
								Have any questions? Please email our Sales Team -{' '}
								<a
									href="mailto:sales@adpushup.com"
									className="u-padding-0 u-margin-0 link link--primary"
								>
									sales@adpushup.com
								</a>
							</span>
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
