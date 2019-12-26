import React from 'react';
import { Button } from '@/Client/helpers/react-bootstrap-imports';
import PropTypes from 'prop-types';
import Spinner from '../Spinner';

const CustomButton = ({ children, variant, showSpinner, className, ...props }) => (
	<Button className={`btn--${variant}${className ? ` ${className}` : ''}`} {...props}>
		{showSpinner && <Spinner size={11} color={variant === 'primary' ? '#fff' : 'primary'} />}{' '}
		{children}
	</Button>
);

CustomButton.propTypes = {
	variant: PropTypes.oneOf(['primary', 'secondary']),
	type: PropTypes.oneOf(['submit', 'button']),
	showSpinner: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.node]).isRequired
};

CustomButton.defaultProps = {
	variant: 'primary',
	type: 'button',
	showSpinner: false
};

export default CustomButton;
