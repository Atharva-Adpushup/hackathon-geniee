import React from 'react';
import { Button } from '@/Client/helpers/react-bootstrap-imports';
import PropTypes from 'prop-types';
import Spinner from '../Spinner';

const ApButton = ({ children, variant, showSpinner, className, ...props }) => (
	<Button className={`btn--${variant}${className ? ` ${className}` : ''}`} {...props}>
		{showSpinner && <Spinner size={11} color={variant === 'primary' ? '#fff' : 'primary'} />}{' '}
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
