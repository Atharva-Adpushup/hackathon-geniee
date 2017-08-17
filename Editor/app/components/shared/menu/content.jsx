import React, { PropTypes } from 'react';

const MenuContent = (props) => (
	<div className="MenuBarContainerWrapper">
		{props.contentHeading ? (<h5 className="head"><a>{props.contentHeading}</a><i className={`pull-right fa  + ${props.icon}`} /></h5>) : null}
		<div className="MenuBarContainer">
			<div className="MenuBarInner">
                {
                    props.children && props.children.props.channels.length
                    ? props.children
                    : (
                        <div className="emptyChannelMenu">
                            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
                            <p>All channels already open</p>
                        </div>
                    )
                }
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
