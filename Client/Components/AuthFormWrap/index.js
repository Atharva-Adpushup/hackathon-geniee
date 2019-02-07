import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const AuthFormWrap = ({ formType, onSubmit, children }) => (
	<div
		data-ui-component="user-login"
		id="login"
		className="LoginWrap form-container js-form-container"
	>
		{/* Header Starts Here */}
		<div className="LoginHead">
			<div className="LoginHead-logo" />
			<h3 id="login-heading" className="form-container-heading">
				{formType === 'login' && 'Sign in'}
				{formType === 'signup' && 'Sign up'}
				{formType === 'forgotPassword' && 'Forgot Password'}
			</h3>
		</div>
		{/* Header Ends Here */}

		{/* <!-- Form Starts Here--> */}
		<form className="form-horizontal" onSubmit={onSubmit}>
			<div className="LoginForm">{children}</div>

			{/* <!-- Form Ends Here--> */}

			{/* <!-- Footer Section Starts Here--> */}
			{formType === 'login' && (
				<div className="LoginFooter row">
					<div className="pull-right">
						Don&apos;t have an account?
						<Link to="/signup" id="login-signup-redirect-link" className="btn btn-lightBg">
							Sign up
						</Link>
					</div>
				</div>
			)}

			{formType === 'signup' && (
				<div className="LoginFooter row text-center">
					<div>
						Already have an account?
						<Link to="/login" id="signup-login-redirect-btn" className="btn btn-lightBg">
							Login!
						</Link>
					</div>
					<span className="u-padding-0px label label--text-faded">
						Have any questions? Please email our Sales Team -{' '}
						<a
							href="mailto:sales@adpushup.com"
							className="u-padding-0px u-margin-0px link link--primary"
						>
							sales@adpushup.com
						</a>
					</span>
				</div>
			)}

			{formType === 'forgotPassword' && (
				<div className="LoginFooter row">
					<div className="col-xs-6">
						<button
							type="submit"
							id="forgotPassword-submit"
							className="btn btn-lg btn-default btn-lightBg"
						>
							Reset Password
						</button>
					</div>
					<div className="col-xs-6">
						<Link
							to="/login"
							id="forgotPassword-login-redirect-link"
							className="btn btn-lg btn-default btn-lightBg"
						>
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
