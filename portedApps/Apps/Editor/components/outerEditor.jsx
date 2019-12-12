import React from 'react';
import ChannelManager from 'containers/channelManagerContainer.js';
import VariationManager from 'containers/variationManagerContainer.js';
import InsertMenu from 'containers/insertMenuContainer.js';
import EditMenu from 'containers/editMenuContainer.js';
import NewChannelMenu from 'containers/newChannelMenuContainer.js';
import AfterSaveLoaderContainer from 'containers/afterSaveLoaderContainer.js';
import SiteModesPopoverContainer from 'containers/siteModesPopoverContainer.js';
import ChannelMenuContainer from 'containers/channelMenuContainer.js';
import NotificationContainer from 'containers/notificationContainer';

const OuterEditor = () => (
	<div>
		<NotificationContainer />
		<ChannelManager />
		<InsertMenu />
		<VariationManager />
		<EditMenu />
		<NewChannelMenu />
		<AfterSaveLoaderContainer />
		<SiteModesPopoverContainer />
		<ChannelMenuContainer />
	</div>
);

export default OuterEditor;
