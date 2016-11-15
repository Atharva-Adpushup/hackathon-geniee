import React, { PropTypes } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import Info from './info.jsx';
import CloseChannel from './closeChannel.jsx';

const channelMenu = ({ isVisible, allChannels, activeChannelId,
	position, hideMenu, saveSampleUrl, channel, partner, closeChannel }) => {

	if (!isVisible) {
		return null;
	}

	const items = [],
		saveSampleUrlData = (sampleUrl) => {
			saveSampleUrl(activeChannelId, sampleUrl);
		},
		closeChannelById = () => {
			closeChannel(activeChannelId);
		};

	items.push((
		<MenuItem key={1} icon="fa fa-info" contentHeading="Page Group Info">
			<Info onSampleUrlChange={saveSampleUrlData} channel={channel} />
		</MenuItem>
	));

	items.push((
		<MenuItem key={2} icon="fa fa-times" contentHeading="Close Channel">
			<CloseChannel closeChannelById={closeChannelById} />
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
