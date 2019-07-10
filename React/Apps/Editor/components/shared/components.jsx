import React from 'react';

const CustomButton = props => {
	return (
		<div
			className={`btn btn-lightBg btn-default ${props.classNames ? props.classNames : ''}`}
			style={{ display: 'inline', float: 'right', ...props.styles }}
			onClick={props.handler}
		>
			{props.label}
		</div>
	);
};

export { CustomButton };
