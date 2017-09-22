import React, { PropTypes } from 'react';
import $ from 'jquery';

const gStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: $(window).height(),
		zIndex: 1000
	},
	Glass = props => (
		<div
			style={!props.shim ? gStyle : { ...gStyle, backgroundColor: 'rgba(0, 0, 0, .45)' }}
			onClick={props.clickHandler}
		/>
	);

Glass.propTypes = {
	clickHandler: PropTypes.func.isRequired,
	shim: PropTypes.bool.isRequired
};

Glass.defaultProps = {
	clickHandler: () => {},
	shim: false
};

export default Glass;
