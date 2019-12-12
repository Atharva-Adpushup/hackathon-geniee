import React, { PropTypes } from 'react';

function emptyRender() {
	return (
		<div className="emptyChannelMenu">
			<i className="fa fa-exclamation-triangle" aria-hidden="true" />
			<p>All channels already open</p>
		</div>
	);
}

const MenuContent = props => (
	<div className="MenuBarContainerWrapper">
		{props.contentHeading ? (
			<h5 className="head">
				<a>{props.contentHeading}</a>
				<i className={`pull-right fa  + ${props.icon}`} />
			</h5>
		) : null}
		<div className="MenuBarContainer">
			<div className="MenuBarInner">
				{props.children
					? props.children.props.channels &&
						typeof props.children.props.channels == 'object' &&
						!props.children.props.channels.length
						? emptyRender()
						: props.children
					: emptyRender()}
			</div>
		</div>
	</div>
);

MenuContent.propTypes = {
	contentHeading: PropTypes.string,
	icon: PropTypes.string,
	children: React.PropTypes.object
};

export default MenuContent;
