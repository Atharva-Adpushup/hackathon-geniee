import React from 'react';

const fn = {
	getClassnames: type => {
		switch (type) {
			case 'error':
				return 'error-text';
			case 'success':
				return 'success-text';
			default:
			case 'info':
				return 'info-text';
		}
	}
};

const CustomMessage = props => {
	let header = props.header || 'Error | Invalid value(s)',
		message = props.message || 'Please check the details.',
		type = props.type ? props.type : 'error',
		classNames = fn.getClassnames(type);

	return (
		<div className={`custom-message ${classNames}`}>
			<h3 className="cm-header">{header}</h3>
			<hr />
			<p className="cm-body">{message}</p>
		</div>
	);
};

export { CustomMessage };
