import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const CustomButton = ({ children, ...props }) => <Button {...props}>{children}</Button>;

CustomButton.propTypes = {
	variant: PropTypes.oneOf([
		'primary',
		'secondary',
		'success',
		'warning',
		'danger',
		'info',
		'light',
		'dark',
		'link'
	]),
	type: PropTypes.oneOf(['submit', 'button']),
	showSpinner: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired
};

CustomButton.defaultProps = {
	variant: 'primary',
	type: 'button',
	showSpinner: false
};

export default CustomButton;
