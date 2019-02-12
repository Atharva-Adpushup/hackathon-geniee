import React from 'react';
import PropTypes from 'prop-types';

const getClassnames = type => {
	switch (type) {
		case 'error':
			return 'error-text';
		case 'success':
			return 'success-text';
		default:
		case 'info':
			return 'info-text';
	}
};

const CustomMessage = props => {
	const { header, message, type } = props;
	const classNames = getClassnames(type);

	return (
		<div className={`custom-message ${classNames}`}>
			<h3 className="cm-header">{header}</h3>
			<hr />
			<p className="cm-body" dangerouslySetInnerHTML={{ __html: message }} />
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
