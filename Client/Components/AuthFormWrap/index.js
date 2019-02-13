import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CustomButton from '../CustomButton';

const AuthFormWrap = ({ formType, onSubmit, children }) => (
	<div className="AuthWrap">
		{/* Header Starts Here */}
		<div className="AuthHead">
			<div className="AuthHead-logo" />
			<h3 id="auth-heading" className="form-container-heading">
				{formType === 'login' && 'Sign in'}
				{formType === 'signup' && 'Sign up'}
				{formType === 'forgotPassword' && 'Forgot Password'}
			</h3>
		</div>
		{/* Header Ends Here */}

		{/* <!-- Form Starts Here--> */}
		<form className="u-margin-b0" onSubmit={onSubmit}>
			{children}

			{/* <!-- Form Ends Here--> */}

			{/* <!-- Footer Section Starts Here--> */}
			{formType === 'login' && (
				<div className="AuthFooter LoginFooter row">
					<div className="pull-right">
						Don&apos;t have an account?
						<Link to="/signup" id="auth-signup-redirect-link" className="btn btn--secondary">
							Sign up
						</Link>
					</div>
				</div>
			)}

			{formType === 'signup' && (
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
			)}

			{formType === 'forgotPassword' && (
				<div className="AuthFooter ForgotPswFooter row">
					<div className="col-xs-6">
						<CustomButton type="submit" id="forgotPassword-submit" variant="secondary">
							Reset Password
						</CustomButton>
					</div>
					<div className="col-xs-6">
						<Link to="/login" id="forgotPassword-auth-redirect-link" className="btn btn--secondary">
							Or, Go Back
						</Link>
					</div>
				</div>
			)}
		</form>
	</div>
);

AuthFormWrap.propTypes = {
	formType: PropTypes.oneOf(['login', 'signup', 'forgotPassword']).isRequired,
	children: PropTypes.element.isRequired
};

export default AuthFormWrap;
