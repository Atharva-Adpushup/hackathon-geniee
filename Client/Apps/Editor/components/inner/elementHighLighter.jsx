import React, { PropTypes } from 'react';

const style = {
		top: 0,
		left: 0,
		height: 0,
		display: 'block',
		width: '100%',
		zIndex: 9998,
		background: '#3d464e',
		position: 'absolute',
		margin: '0',
		minHeight: '0',
		minWidth: '0',
		padding: '0',
		opacity: '.8',
		overflow: 'hidden'
	},
	ElementSelector = props => {
		const cords = props.cords;
		return (
			<div>
				<div>
					<div className="ovelayTop" style={Object.assign({}, style, cords.TOP)} />
					<div className="ovelayLeft" style={Object.assign({}, style, cords.LEFT)} />
					<div className="ovelayRight" style={Object.assign({}, style, cords.RIGHT)} />
					<div className="ovelayBottom" style={Object.assign({}, style, cords.BOTTOM)} />
				</div>
			</div>
		);
	};

ElementSelector.propTypes = {
	hbBox: PropTypes.object
};

export default ElementSelector;
