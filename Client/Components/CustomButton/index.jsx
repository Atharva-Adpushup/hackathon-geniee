import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CustomButton = ({ children, variant, className, ...props }) => (
	<Button className={`btn--${variant}${className ? ` ${className}` : ''}`} {...props}>
		{children}
	</Button>
);

CustomButton.propTypes = {
	variant: PropTypes.oneOf(['primary', 'secondary']),
	type: PropTypes.oneOf(['submit', 'button']),
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired
};

CustomButton.defaultProps = {
	variant: 'primary',
	type: 'button'
};

export default CustomButton;
