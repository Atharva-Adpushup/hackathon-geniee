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
	const header = props.header || 'Error | Invalid value(s)';
	const message = props.message || 'Please check the details.';
	const type = props.type ? props.type : 'error';
	const classNames = fn.getClassnames(type);

	return (
		<div className={`custom-message ${classNames}`}>
			<h3 className="cm-header">{header}</h3>
			<hr />
			<p className="cm-body" dangerouslySetInnerHTML={{ __html: message }} />
		</div>
	);
};
const CustomButton = props => (
	<button
		className={`btn btn-lightBg btn-default custom-btn ${props.classNames ? props.classNames : ' '}`}
		style={props.style ? props.style : {}}
		onClick={props.handler}
	>
		{props.label}
	</button>
);
const EmptyState = props => (
	<div className="empty-state">
		<img src="/assets/images/empty.png" alt="Empty State" />
		{props.message ? <h2>{props.message}</h2> : ''}
	</div>
);
const CustomInput = props => (
	<input
		className={`inputMinimal ${props.classNames ? props.classNames : ' '}`}
		type={props.type}
		style={{ width: '100%' }}
		name={props.name}
		value={props.value ? props.value : ''}
		placeholder={props.placeholder ? props.placeholder : 'Enter value here'}
		onChange={props.handler}
	/>
);

export { CustomMessage, CustomButton, CustomInput, EmptyState };
