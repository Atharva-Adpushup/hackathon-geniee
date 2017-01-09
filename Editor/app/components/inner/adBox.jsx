import React, { PropTypes } from 'react';
import $ from 'jquery';
import Utils from 'libs/utils';
import _ from 'lodash';
import reactCSS from 'reactcss';

const highLighterClass = '_APD_highlighter',
	adBoxSizeStyles = reactCSS({
		'default': {
			size: {
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
				pointerEvents: 'none'
			}
		}
	}),
	listStyle = {
		position: 'absolute',
		width: '100%',
		pointerEvents: 'none'
	},
	AdBox = (props) => {
		const { id, width, height, css } = props.ad,
			adBoxSizeContent = (`${width} X ${height}`),
			clickHandler = (ev) => {
				const $el = $(ev.target),
					position = Utils.dom.getElementBounds($(ev.target));
				props.clickHandler(id, position, Utils.ui.getElementSelectorCords($el));
			};


		_.each(css, (value, key) => {
			delete css[key];
			css[_.camelCase(key)] = value;
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
				<div id={`ad-${id}`} className={highLighterClass} onClick={clickHandler} style={adBoxStyles}>
					<div className="_AP_adSize _ap_reject" style={adBoxSizeStyles}>
						{adBoxSizeContent}
					</div>
				</div>
			</div>
		);
	};

AdBox.propTypes = {
	ad: PropTypes.object.isRequired,
	clickHandler: PropTypes.func.isRequired
};

export default AdBox;
