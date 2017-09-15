import React, { PropTypes } from 'react';
import $ from 'jquery';
import Utils from 'libs/utils';
import _ from 'lodash';

const highLighterClass = '_APD_highlighter',
	adBoxSizeStyles = {
		background: '#eb575c',
		borderRadius: '3px',
		color: '#fff',
		fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
		fontSize: '12px',
		fontWeight: '400',
		left: '5px',
		padding: '4px',
		position: 'absolute',
		top: '5px',
		pointerEvents: 'none',
		lineHeight: '20px'
	},
	listStyle = {
		position: 'absolute',
		width: '100%',
		pointerEvents: 'none'
	},
	renderCustomZoneIdLabel = (customZoneIdStyles, customZoneIdText) => {
		return (
			<div className="_AP_customZoneId _ap_reject" style={customZoneIdStyles}>
				{customZoneIdText}
			</div>
		);
	},
	AdBox = props => {
		const { id, width, height } = props.ad,
			css = Object.assign({}, props.ad.css),
			adBoxSizeContent = `${width} X ${height}`,
			clickHandler = ev => {
				const $el = $(ev.target),
					position = Utils.dom.getElementBounds($(ev.target));
				props.clickHandler(id, position, Utils.ui.getElementSelectorCords($el));
			},
			isPartnerData = !!props.partnerData,
			isNetworkGeniee = !!(props.ad.network && props.ad.network === 'geniee'),
			isCustomZoneId = !!(isPartnerData && isNetworkGeniee && props.partnerData.customZoneId),
			customZoneIdText = isCustomZoneId ? 'Zone ID' : '';
		let customZoneIdStyles = $.extend(true, {}, adBoxSizeStyles, {
			background: '#3498db',
			left: '70px'
		});

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
		});

		return (
			<div style={listStyle}>
				<div id={`ad-${id}`} className={highLighterClass} onClick={clickHandler} style={adBoxStyles}>
					<div className="_AP_adSize _ap_reject" style={adBoxSizeStyles}>
						{adBoxSizeContent}
					</div>
					<div className="_AP_adSize _ap_reject" style={adBoxSizeStyles}>
						{props.sectionName}
					</div>
					{isCustomZoneId ? renderCustomZoneIdLabel(customZoneIdStyles, customZoneIdText) : null}
				</div>
			</div>
		);
	};

AdBox.propTypes = {
	ad: PropTypes.object.isRequired,
	clickHandler: PropTypes.func.isRequired,
	partnerData: PropTypes.object
};

export default AdBox;