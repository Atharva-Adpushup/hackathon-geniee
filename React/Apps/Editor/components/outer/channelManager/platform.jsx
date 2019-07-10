import React, { PropTypes } from 'react';

const Platform = props => {
	const platform = props.type;
	let platformClass = 'defaultPlatform',
		viewPortClass = 'defaultViewPort';

	switch (platform.toLowerCase()) {
		case 'desktop':
			platformClass = 'desktopEditor';
			viewPortClass = 'desktopViePort';
			break;

		case 'mobile':
			platformClass = 'iphone6sPortrait';
			viewPortClass = 'iphone6sViePort';
			break;

		case 'tablet':
			platformClass = 'ipadAirPortrait';
			viewPortClass = 'ipadAirViePort';
			break;
		default:
			break;
	}

	return (
		<div id="editorPlatform" className={`platform ${platformClass}`}>
			<div id="editorViewPort" className={viewPortClass}>
				{props.children}
			</div>
		</div>
	);
};

Platform.propTypes = {
	type: PropTypes.string.isRequired,
	children: React.PropTypes.arrayOf(React.PropTypes.element).isRequired
};

Platform.defaultProps = {
	type: 'desktop'
};

export default Platform;
