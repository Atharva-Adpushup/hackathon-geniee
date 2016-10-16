import React, {PropTypes} from 'react';


const MenuContent = (props) => (
	<div className="MenuBarContainerWrapper">
		{props.contentHeading ? (<h5 className="head"><a>{props.contentHeading}</a><i className={`pull-right fa  + ${props.icon}`}></i></h5>) : null}
		<div className="MenuBarContainer">
			<div className="MenuBarInner">{props.children}</div>
		</div>
	</div>
  );

MenuContent.propTypes = {
	contentHeading: PropTypes.string,
	icon: PropTypes.string,
	children: React.PropTypes.object
};

export default MenuContent;
