var React = window.React,
	CommonConsts = require('editor/commonConsts'),
	Fluxxor = require('libs/third-party/fluxxor'),
	FluxMixin = Fluxxor.FluxMixin(React),
	Platform = require('./platform.jsx'),
	Loader = require('../loader.jsx'),
	Tabs = require('./tabs/tab.jsx'),
	TabPane = require('./tabs/tabPane.jsx'),
	ActionManager = require('../ActionManger/actionManager.jsx'),
	Modal = require('BootstrapComponents/Modal.jsx'),
	OverlayMixin = require('BootstrapComponents/OverlayMixin'),
	Glass = require('CustomComponents/glass.jsx');

module.exports = React.createClass({

	mixins: [FluxMixin, OverlayMixin],

	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {
			glassVisibility: false,
			showChannelSettings: false,
			showIncontentSettings: false
		};
	},
	toggleChannelSettings: function() {
		this.setState({ showChannelSettings: !this.state.showChannelSettings });
	},
	toggleIncontentSettings: function() {
		this.setState({ showIncontentSettings: !this.state.showIncontentSettings });
	},
	setActiveChannel: function(channel) {
		this.getFlux().actions.setActiveChannel(channel);
	},
	saveChannel: function(channel) {
		this.getFlux().actions.saveChannel(channel);
	},
	closeChannel: function(channel) {
		this.getFlux().actions.closeChannel(channel);
	},
	toggleGlass: function() {
		this.getFlux().actions.hideContextMenu();
		this.setState({ glassVisibility: !this.state.glassVisibility });
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({ glassVisibility: nextProps.glassVisibility });
	},
	renderOverlay: function() {
		var actions;
		if (this.state.showChannelSettings) {
			actions = this.getFlux().store('ActionsStore').getChannelSiteMergedActions(this.props.state.activeChannel.id);
			return (
				<Modal keyboard animation className="_ap_modal" title="Channel Settings" onRequestHide={this.toggleChannelSettings}>
					<div className="modal-body">
						<ActionManager adNetworks={this.props.adNetworks} activeId={this.props.state.activeChannel.id} owner={CommonConsts.enums.actionManager.levels.CHANNEL} flux={this.getFlux() } audiences={this.props.audiences} templates={this.props.templates} actions={actions}/>
					</div>
				</Modal>
			);
		} else if (this.state.showIncontentSettings) {
			actions = this.getFlux().store('ActionsStore').getChannelIncontentSectionMergedActions(this.props.state.activeChannel.id);
			return (
				<Modal keyboard animation className="_ap_modal" title="Channel Incontent Settings" onRequestHide={this.toggleIncontentSettings}>
					<div className="modal-body">
						<ActionManager adNetworks={this.props.adNetworks} activeId={this.props.state.activeChannel.id} owner={CommonConsts.enums.actionManager.levels.INCONTENT_SECTION} flux={this.getFlux() } audiences={this.props.audiences} templates={this.props.templates} actions={actions}/>
					</div>
				</Modal>
			);
		}
		return null;
	},
	render: function() {
		var state = this.props.state,
			tabOptions,
			tabPanes = state.openChannels.map(function(channel) {
				var proxyUrl = (channel.useAlternateProxy) ? CommonConsts.enums.proxy.SIMULATED_PROXY_URL : CommonConsts.enums.proxy.HTTP_PROXY_URL,
					urlParts = channel.sampleUrl.split('#'),
					actualUrl = urlParts[0],
					hashPart = '',
					iframeUrl = '';

				if (urlParts.length > 1) {
					urlParts = urlParts.splice(1);
					hashPart = urlParts.join('#');
				}

				iframeUrl = proxyUrl + '?channelId=' + channel.id + '&url=' + btoa(actualUrl) + '&siteDomain=' + window.ADP_SITE_DOMAIN + '&platform=' + channel.platform + '&adpOrigin=' + window.ADP_ORIGIN + '&baseUrl=' + window.ADP_BASEURL + '&useAlternateProxy=' + channel.useAlternateProxy;
				iframeUrl = iframeUrl + (hashPart ? '#' + hashPart : '');

				tabOptions = [];
				tabOptions.push((<li onClick={this.toggleChannelSettings}>Channel Settings</li>));
				tabOptions.push((<li onClick={this.toggleIncontentSettings}>Incontent Settings</li>));
				tabOptions.push((<li onClick={this.closeChannel.bind(null, channel) }>Close Channel</li>));

				return (
					<TabPane tabOptions = {tabOptions} handleClick={this.setActiveChannel.bind(null, channel) }  key={channel.id} title={channel.channelName}>
						<Platform isAdRecover={channel.isAdRecover} type={channel.platform} os={channel.os}>
							{this.state.glassVisibility ? <Glass clickHandler={this.toggleGlass} /> : null}
							<Loader loading={channel.loading} />
							<iframe data-adpid={'iframe' + channel.id} src={iframeUrl} style={{
								width: '100%',
								height: '100%'
							}} />
						</Platform>
					</TabPane>
				);
			}.bind(this));


		return (<Tabs allChannels={this.props.allChannels} adRecoverMode={this.props.adRecoverMode} siteMode={this.props.siteMode} channels={this.props.state.channels} cmsInfo={this.props.cmsInfo} audiences={this.props.audiences} adNetworks={this.props.adNetworks} templates={this.props.templates} activeKey={state.activeChannel ? state.activeChannel.id : null}>
			{tabPanes}
		</Tabs>);
	}
});
