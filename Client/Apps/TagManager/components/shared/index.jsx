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
	},
	CustomMessage = props => {
		let header = props.header || 'Error | Invalid value(s)',
			message = props.message || 'Please check the details.',
			type = props.type ? props.type : 'error',
			classNames = fn.getClassnames(type);

		return (
			<div className={`custom-message ${classNames}`}>
				<h3 className="cm-header">{header}</h3>
				<hr />
				<p className="cm-body" dangerouslySetInnerHTML={{ __html: message }} />
			</div>
		);
	},
	CustomButton = props => {
		return (
			<div
				className={`btn btn-lightBg btn-default custom-btn ${props.classNames ? props.classNames : ' '}`}
				onClick={props.handler}
			>
				{props.label}
			</div>
		);
	},
	EmptyState = props => {
		return (
			<div className="empty-state">
				<img src="/assets/images/empty.png" />
				{props.message ? <h2>{props.message}</h2> : ''}
			</div>
		);
	},
	CustomInput = props => {
		return (
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
	};

export { CustomMessage, CustomButton, CustomInput, EmptyState };
