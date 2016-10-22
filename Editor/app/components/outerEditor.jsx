import React from 'react';
import ChannelManager from 'containers/channelManagerContainer.js';
import VariationManager from 'containers/variationManagerContainer.js';
import InsertMenu from 'containers/insertMenuContainer.js';
import EditMenu from 'containers/editMenuContainer.js';
import NewChannelMenu from '../containers/newChannelMenuContainer.js';

const OuterEditor = () => (
	<div>
		<ChannelManager />
		<InsertMenu />
		<VariationManager />
		<EditMenu />
		<NewChannelMenu />
	</div>
);

export default OuterEditor;
