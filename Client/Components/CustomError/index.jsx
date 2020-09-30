import React from 'react';
import PropTypes from 'prop-types';

const CustomError = ({ message, imgSrc, ...rest }) => (
	<div className="empty-state" {...rest}>
		<img src={imgSrc || '/assets/images/error.png'} alt="Error" />
		<h2>{message}</h2>
	</div>
);

CustomError.propTypes = {
	message: PropTypes.string
};

CustomError.defaultProps = {
	message: 'Oops! Seems like something is broken. Please contact AdPushup Operations Team.'
};

export default CustomError;
