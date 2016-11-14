import React from 'react';
import ChannelManager from 'containers/channelManagerContainer.js';
import VariationManager from 'containers/variationManagerContainer.js';
import InsertMenu from 'containers/insertMenuContainer.js';
import EditMenu from 'containers/editMenuContainer.js';
import NewChannelMenu from 'containers/newChannelMenuContainer.js';
import AfterSaveLoaderContainer from 'containers/afterSaveLoaderContainer.js';
import SiteModesPopoverContainer from 'containers/siteModesPopoverContainer.js';

const OuterEditor = () => (
	<div>
		<ChannelManager />
		<InsertMenu />
		<VariationManager />
		<EditMenu />
		<NewChannelMenu />
		<AfterSaveLoaderContainer />
		<SiteModesPopoverContainer />
	</div>
);

export default OuterEditor;
