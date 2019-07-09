import React, { PropTypes } from 'react';
import $ from 'jquery';
import Utils from 'libs/utils';
import { proxy } from 'consts/commonConsts.js';
import Loader from 'shared/loader.jsx';
import Platform from './platform.jsx';
import Tabs from './tabs/tab.jsx';
import TabPane from './tabs/tabPane.jsx';

const getIframeUrl = channel => {
	let urlParts = channel.sampleUrl.split('#'),
		hashPart,
		iframeUrl;

	const actualUrl = urlParts[0];

	if (urlParts.length > 1) {
		urlParts = urlParts.splice(1);
		hashPart = urlParts.join('#');
	}
	iframeUrl = `${proxy.HTTP_PROXY_URL}?channelId=${channel.id}&url=${btoa(actualUrl)}
				&siteDomain=${window.ADP_SITE_DOMAIN}&platform=${channel.platform}&adpOrigin=${window.ADP_ORIGIN}&baseUrl=${window.ADP_BASEURL}&useAlternateProxy=${channel.useAlternateProxy}`;
	iframeUrl = iframeUrl + (hashPart ? `#${hashPart}` : '');
	return iframeUrl;
};

class channelManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.handleMenuClick = this.handleMenuClick.bind(this);
	}

	handleMenuClick() {
		this.props.showNewChannelMenu(Utils.ui.outerMenuRenderPosition($('#adNewChannel')));
	}

	render() {
		const props = this.props;

		return (
			<Tabs
				toggleEditorMode={props.toggleEditorMode}
				showPublisherHelper={props.showPublisherHelper}
				masterSave={props.masterSave}
				handleNewChannelMenu={this.handleMenuClick}
				showOptionsMenu={props.showOptionsMenu}
				siteMode={props.siteMode}
				channels={props.channels}
				activeKey={props.activeChannelId}
			>
				{props.openChannels.map(channel => (
					<TabPane
						showChannelMenu={props.showChannelMenu}
						handleClick={props.setActiveChannel.bind(null, channel.id)}
						key={channel.id}
						title={channel.channelName}
					>
						<Platform type={channel.platform}>
							<Loader loading={channel.isLoading} />
							<iframe
								data-adpid={`iframe${channel.id}`}
								src={getIframeUrl(channel)}
								style={{
									width: '100%',
									height: '100%'
								}}
							/>
						</Platform>
					</TabPane>
				))}
			</Tabs>
		);
	}
}

channelManager.propTypes = {
	toggleEditorMode: PropTypes.func.isRequired,
	showPublisherHelper: PropTypes.func.isRequired,
	showNewChannelMenu: PropTypes.func.isRequired,
	masterSave: PropTypes.func.isRequired,
	showOptionsMenu: PropTypes.func.isRequired,
	setActiveChannel: PropTypes.func.isRequired,
	siteMode: PropTypes.number.isRequired,
	activeChannel: PropTypes.string,
	channels: PropTypes.object.isRequired,
	openChannels: React.PropTypes.array.isRequired
};

export default channelManager;
