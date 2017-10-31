import React from 'react';

const PaneLoader = props => {
	let styles = {
		height: '300px',
		background: '#eee',
		textAlign: 'center',
		fontSize: '1.4em',
		padding: '140px',
		color: '#555'
	};

	let stateIcon = null;

	if (props.styles) {
		styles = { ...styles, ...props.styles };
	}

	if (props.state) {
		switch (props.state) {
			case 'error':
				stateIcon = <i className="fa fa-exclamation-circle pane-loader-icon" />;
				break;
			case 'load':
				stateIcon = <i className="fa fa-cog fa-spin pane-loader-icon" />;
				break;
		}
	}

	let message = (
		<div>
			{stateIcon}&nbsp;&nbsp;&nbsp;
			{props.message ? props.message : 'Loading...'}
		</div>
	);

	return <div style={styles}>{message}</div>;
};

export default PaneLoader;
