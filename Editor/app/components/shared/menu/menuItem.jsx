import React, { PropTypes } from 'react';
import Content from './content.jsx';

const MenuItem = (props) => {
	const content = [];

	function createMarkup(html) {
		return { __html: html };
	}

	if (props.icon === 'apSize') {
		content.push(<i key={1} dangerouslySetInnerHTML={createMarkup(props.text.split(' ').join('</br>'))} className="apSize" />);
		content.push(<div key={2} className="apcross" />);
	} else {
		content.push(<i key={1} className={`fa ${props.icon}`} />);
	}

	return (
		<li>
			<a href="#" onClick={props.onClick} className={props.isActive === true ? 'MenuBarItem active ' : 'MenuBarItem'}>
				{content}
			</a>
			<div style={props.isActive ? { display: 'block', position: 'absolute', top: 0, zIndex: -1 } : { display: 'none' }} >
				<Content contentHeading={props.contentHeading}>{React.cloneElement(props.children, { onUpdate: props.onUpdate })}</Content>
			</div>
		</li>
	);
};

MenuItem.propTypes = {
	isActive: PropTypes.bool.isRequired,
	onClick: PropTypes.func,
	contentHeading: PropTypes.string.isRequired,
	icon: PropTypes.string,
	text: PropTypes.string,
	children: React.PropTypes.object
};

MenuItem.defaultProps = {
	isActive: false
};

export default MenuItem;
