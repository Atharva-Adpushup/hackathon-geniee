import React from 'react';
import PropTypes from 'prop-types';

const getClassnames = type => {
	switch (type) {
		case 'error':
			return 'u-text-error';
		case 'success':
			return 'u-text-success';
		default:
		case 'info':
			return 'u-text-info';
	}
};

const CustomMessage = props => {
	const { header, message, type } = props;
	const classNames = getClassnames(type);

	return (
		<div className={`custom-message u-margin-b2 u-padding-v3 u-padding-h3 ${classNames}`}>
			<h3 className="u-padding-h4 u-text-bold">{header}</h3>
			<hr className="u-margin-v3" />
			<p className="u-margin-0" dangerouslySetInnerHTML={{ __html: message }} />
		</div>
	);
};

CustomMessage.propTypes = {
	header: PropTypes.string,
	message: PropTypes.string,
	type: PropTypes.string
};

CustomMessage.defaultProps = {
	header: 'Header',
	message: 'Message',
	type: 'info'
};

export default CustomMessage;
