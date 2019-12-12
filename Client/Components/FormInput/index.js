import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FormInput = ({ icon, className, ...props }) => (
	<div className="form-group">
		<div className="input-group">
			<span className="input-group-addon">
				<FontAwesomeIcon icon={icon} className="sb-nav-icon" />
			</span>
			<input {...props} className={`form-control input-lg ${className}`} />
		</div>
	</div>
);

FormInput.propTypes = {
	type: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	icon: PropTypes.string.isRequired,
	className: PropTypes.string
};

FormInput.defaultProps = {
	className: ''
};

export default FormInput;
