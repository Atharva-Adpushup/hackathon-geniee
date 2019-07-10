import React, { PropTypes } from 'react';

const MenuItem = props => {
	const content = [];

	function createMarkup(html) {
		return { __html: html };
	}

	if (props.icon === 'apSize') {
		content.push(
			<i key={1} dangerouslySetInnerHTML={createMarkup(props.text.split(' ').join('</br>'))} className="apSize" />
		);
		content.push(<div key={2} className="apcross" />);
	} else {
		content.push(<i key={1} className={`fa ${props.icon}`} />);
	}

	return (
		<li>
			<a
				href="#"
				onClick={props.onClick}
				className={props.isActive === true ? 'MenuBarItem active ' : 'MenuBarItem'}
			>
				{content}
			</a>
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
