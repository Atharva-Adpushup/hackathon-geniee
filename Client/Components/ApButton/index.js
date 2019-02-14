import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ApButton = ({ children, variant, className, ...props }) => (
	<Button className={`btn--${variant}${className ? ` ${className}` : ''}`} {...props}>
		{children}
	</Button>
);

ApButton.propTypes = {
	variant: PropTypes.oneOf(['primary', 'secondary']),
	type: PropTypes.oneOf(['submit', 'button']),
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired
};

ApButton.defaultProps = {
	variant: 'light',
	type: 'button'
};

export default ApButton;
