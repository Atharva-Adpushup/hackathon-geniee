import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import AuthShell from '../../Components/AuthShell';
import AuthFormWrap from '../../Components/AuthFormWrap';
import FormInput from '../../Components/FormInput';
import ApButton from '../../Components/ApButton';
import { forgotPasswordAction } from '../../actions/userActions';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';

class ForgotPassword extends Component {
	state = {
		email: { value: '', error: '' },
		success: '',
		error: ''
	};

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
			email: { value: email }
		} = this.state;

		const validationResult = formValidator.validate({ email }, validationSchema.user.validations);

		let validationErrors = { ...validationResult.errors };

		if (validationResult.isValid) {
			const { forgotPasswordAction: forgotPassword } = this.props;

			forgotPassword(email)
				.then(resp => this.setState({ success: resp.data.success }))
				.catch(({ response }) => {
					if (response.status === 400) {
						validationErrors = {
							...validationErrors,
							...response.data.reduce((accumulator, currValue) => ({
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
			email: { error: emailError },
			success,
			error
		} = this.state;
		return (
			<AuthShell>
				<AuthFormWrap formType="forgotPassword" onSubmit={this.onSubmit}>
					<Fragment>
						{success && <div className="success-message top">{success}</div>}
						{error && <div className="error-message top">{error}</div>}

						<div className="AuthForm ForgotPasswordForm u-padding-h4 u-padding-v3">
							<FormInput
								type="email"
								name="email"
								onChange={this.onChange}
								onBlur={this.onInputBlur}
								icon="envelope"
							/>
							{emailError && <div className="error-message">{emailError}</div>}
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
	{ forgotPasswordAction }
)(ForgotPassword);
