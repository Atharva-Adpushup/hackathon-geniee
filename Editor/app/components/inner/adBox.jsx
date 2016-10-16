import React, { PropTypes } from 'react';
import _ from 'lodash';

const highLighterClass = '_APD_highlighter',
	adBoxSizeStyles = {
		background: '#eb575c !important',
		borderRadius: '3px !important',
		color: '#fff !important',
		fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif !important",
		fontSize: '12px !important',
		fontWeight: '400 !important',
		left: '5px !important',
		padding: '4px !important',
		position: 'absolute !important',
		top: '5px !important',
	},
	camelCase = (input) => {
		return input.toLowerCase().replace(/-(.)/g, (match, group1) => {
			return group1.toUpperCase();
		});
	},
	listStyle = {
		position: 'absolute',
		width: '100%',
		pointerEvents: 'none'
	},
	AdBox = (props) => {
		const { id, width, height, css } = props.ad,
			adBoxSizeContent = (`${width} X ${height}`);

		_(css).each((value, key) => {
			delete css[key];
			css[camelCase(key)] = value;
		});
		const adBoxStyles = Object.assign({
			boxShadow: '#000 0px 0px 0px 2px inset',
			backgroundColor: 'rgba(255, 255, 0, .25)',
			width,
			height,
			pointerEvents: 'auto',
			position: 'relative'
		}, css);
		return (
			<div style={listStyle}>
				<div id={id} className={highLighterClass} onClick={props.clickHandler.bind(null, id)} style={adBoxStyles}>
					<div className="_AP_adSize" style={adBoxSizeStyles}>
						{adBoxSizeContent}
					</div>
				</div>
			</div>
		);
	};

AdBox.propTypes = {
	ad: PropTypes.object.isRequired
};

export default AdBox;
