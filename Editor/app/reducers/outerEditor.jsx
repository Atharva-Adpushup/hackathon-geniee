import React from 'react';
import ChannelManager from 'containers/channelManagerContainer.js';
import VariationManager from 'containers/variationManagerContainer.js';
import InsertMenu from 'containers/insertMenuContainer.js';

const OuterEditor = () => (
	<div>
		<channelManager>
		<variationManager/>
		<InsertMenu/>
	</div>
);

export default OuterEditor;
