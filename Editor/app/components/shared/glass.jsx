import React, { PropTypes } from 'react';
import $ from 'jquery';

const gStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: $(window).height(),
		zIndex: 9999
	},
	Glass = (props) => (
		<div style={!props.shim ? gStyle : { ...gStyle }} onClick={props.clickHandler} />
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
