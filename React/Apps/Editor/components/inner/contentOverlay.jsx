import React, { PropTypes } from 'react';

const contentOverlay = props => {
	const style = Object.assign(
		{},
		{
			top: 0,
			left: 0,
			height: 0,
			width: 0,
			display: 'block',
			zIndex: 100,
			background: '#3d464e',
			position: 'absolute',
			opacity: '.5'
		},
		props.position
	);
	return <div style={style} className="_ap_contentOverlay _ap_reject" />;
};

contentOverlay.propTypes = {
	position: PropTypes.object
};

export default contentOverlay;
