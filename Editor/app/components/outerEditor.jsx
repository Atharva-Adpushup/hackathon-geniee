import React from 'react';
import ChannelManager from 'containers/channelManagerContainer.js';
import VariationManager from 'containers/variationManagerContainer.js';
import InsertMenu from 'containers/insertMenuContainer.js';
import EditMenu from 'containers/editMenuContainer.js';

const OuterEditor = () => (
	<div>
		<ChannelManager />
		<VariationManager />
		<InsertMenu />
		<EditMenu />
	</div>
);

export default OuterEditor;
