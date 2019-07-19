import React, { PropTypes } from 'react';

const style = {
		width: 0,
		height: 0,
		top: 0,
		left: 0,
		boxShadow: 'rgb(255, 27, 27) 0px 0px 0px 2px inset',
		//backgroundColor: 'rgba(255, 27, 27, 0.247059)',
		zIndex: 9999,
		pointerEvents: 'none',
		position: 'absolute'
	},
	HB = props => (
		<div
			className="_APD_highlighter"
			style={Object.assign({}, style, {
				width: props.width,
				height: props.height,
				top: props.top,
				left: props.left
			})}
		/>
	);

HB.propTypes = {
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	top: PropTypes.number.isRequired,
	left: PropTypes.number.isRequired
};

export default HB;
