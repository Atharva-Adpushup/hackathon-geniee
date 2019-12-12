import React, { PropTypes } from 'react';

const TabPane = props => (
	<div className="tabContentArea" style={{ display: props.selected ? 'block' : 'none' }}>
		{props.children}
	</div>
);

TabPane.propTypes = {
	selected: PropTypes.bool,
	children: React.PropTypes.element.isRequired,
	title: React.PropTypes.string.isRequired,
	handleClick: React.PropTypes.func.isRequired
};

export default TabPane;
