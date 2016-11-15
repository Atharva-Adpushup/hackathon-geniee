import React, { PropTypes } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import Info from './info.jsx';
//import CloseChannel from './close.jsx';

const channelMenu = ({ isVisible, allChannels, position, hideMenu, saveSampleUrl, channel, partner }) => {
	if (!isVisible) {
		return null;
	}

	const items = [],
		saveSampleUrlData = (channelId = 1, sampleUrl, forceSampleUrl) => {
			saveSampleUrl(channelId, sampleUrl, forceSampleUrl);
		};

	items.push((
		<MenuItem key={1} icon="fa fa-clipboard" contentHeading="Page Group Info">
			<Info onSampleUrlChange={saveSampleUrlData} channel={channel} />
		</MenuItem>
	));

	return (
		<Menu id="channelMenu" position={position} arrow="top" activeItem={0} onGlassClick={hideMenu}>
			{items}
		</Menu>
	);
};

channelMenu.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	partner: PropTypes.string,
	position: PropTypes.object,
	channels: PropTypes.array,
	hideMenu: PropTypes.func
};

channelMenu.defaultProps = {
	isVisible: false
};

export default channelMenu;
