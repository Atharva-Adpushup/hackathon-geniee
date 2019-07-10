import React from 'react';

const ContentExtension = props => <div className="ContentExtWrap">{props.children}</div>;

ContentExtension.propTypes = {
	children: React.PropTypes.arrayOf(React.PropTypes.element).isRequired
};

export default ContentExtension;
