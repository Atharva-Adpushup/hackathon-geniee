import React, { PropTypes } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import ChannelList from './channelList';

const newChannelMenu = ({ isVisible, channels, position, hideMenu, openChannel, partner }) => {
	if (!isVisible) {
		return null;
	}
	const items = [];
	/*if (partner !== 'geniee') {
		items.push((
			<MenuItem key={1} icon="fa-sitemap" contentHeading="Section Options">
				<div>Test</div>
			</MenuItem>
		));
	}*/
	items.push(
		<MenuItem key={1} icon="fa-sitemap" contentHeading="Section Options">
			<ChannelList channels={channels} onClick={openChannel} />
		</MenuItem>
	);
	return (
		<Menu id="newChannelMenu" position={position} arrow="top" activeItem={0} onGlassClick={hideMenu}>
			{items}
		</Menu>
	);
};

newChannelMenu.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	partner: PropTypes.string,
	position: PropTypes.object,
	channels: PropTypes.array,
	hideMenu: PropTypes.func,
	openChannel: PropTypes.func
};

newChannelMenu.defaultProps = {
	isVisible: false
};

export default newChannelMenu;
