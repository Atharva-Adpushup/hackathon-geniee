import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ApButton = ({ children, ...props }) => <Button {...props}>{children}</Button>;

ApButton.propTypes = {
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
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired
};

ApButton.defaultProps = {
	variant: 'light',
	type: 'button'
};

export default ApButton;
