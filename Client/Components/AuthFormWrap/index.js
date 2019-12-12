import React from 'react';
import PropTypes from 'prop-types';

const AuthFormWrap = ({ formType, onSubmit, children }) => (
	<div className="AuthWrap">
		{/* Header Starts Here */}
		<div className="AuthHead">
			<div className="AuthHead-logo" />
			<h3 id="auth-heading" className="form-container-heading">
				{formType === 'login' && 'Sign in'}
				{formType === 'signup' && 'Sign up'}
				{formType === 'forgotPassword' && 'Forgot Password'}
				{formType === 'resetPassword' && 'Reset Password'}
			</h3>
		</div>
		{/* Header Ends Here */}

		{/* <!-- Form Starts Here--> */}
		<form className="u-margin-b0" onSubmit={onSubmit}>
			{children}
		</form>
		{/* <!-- Form Ends Here--> */}
	</div>
);

AuthFormWrap.propTypes = {
	formType: PropTypes.oneOf(['login', 'signup', 'forgotPassword', 'resetPassword']).isRequired,
	children: PropTypes.element.isRequired
};

export default AuthFormWrap;
