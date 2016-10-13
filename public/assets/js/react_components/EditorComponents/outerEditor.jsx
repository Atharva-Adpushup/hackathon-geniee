var React = window.React,
	Fluxxor = require('libs/third-party/fluxxor'),
	_ = require('libs/third-party/underscore.js'),
	CommonConsts = require('editor/commonConsts'),
	AM = CommonConsts.enums.actionManager,
	Stores = CommonConsts.enums.stores,
	CM = CommonConsts.enums.components,

	ChannelManager = require('./OuterComponents/ChannelManager/channelManager.jsx'),
	PublishHelper = require('./OuterComponents/PublishHelper/publishHelper.jsx'),
	PopupInfoBox = require('./OuterComponents/PopupManager/popupInfoBox.jsx'),
	InsertMenu = require('./OuterComponents/ContextMenu/insertMenu.jsx'),
	EditMenu = require('./OuterComponents/ContextMenu/editMenu.jsx'),
	ChannelMenu = require('./OuterComponents/ChannelManager/ChannelMenu/channelMenu.jsx'),
	NewChannelMenu = require('./OuterComponents/ChannelManager/NewChannel/newChannelMenu.jsx'),
	MiscMenu = require('./OuterComponents/OptionsMenu/optionsMenu.jsx'),
	CodeEditor = require('./OuterComponents/ChannelManager/codeEditor.jsx'),
	PageGroupGuider = require('./OuterComponents/Guiders/pageGroupGuider.jsx'),
	AdInsertionGuider = require('./OuterComponents/Guiders/adInsertionGuider.jsx'),
	PublishGuider = require('./OuterComponents/Guiders/publishGuider.jsx'),
	HelpTrigger = require('./OuterComponents/Guiders/helpTrigger.jsx'),
	AfterSaveModal = require('./OuterComponents/ChannelManager/afterSaveModal.jsx'),
	Faq = require('./OuterComponents/Guiders/faq.jsx'),
	Notifications = require('./OuterComponents/notifications.jsx'),
	Loader = require('./OuterComponents/loader.jsx'),
	DebugInfo = require('./OuterComponents/debugInfo.jsx'),
	Wizard = require('./OuterComponents/wizard.jsx'),
	SiteLoadingModal = require('./OuterComponents/siteLoadingModal.jsx'),
	NetworkManager = require('./OuterComponents/NetworkManager/networkManager.jsx'),
	SectionManager = require('./OuterComponents/SectionManager/sectionManager.jsx'),

	FluxMixin = Fluxxor.FluxMixin(React),
	StoreWatchMixin = Fluxxor.StoreWatchMixin;


module.exports = React.createClass({

	mixins: [FluxMixin, StoreWatchMixin(Stores.SITE_STORE, Stores.CHANNEL_STORE, Stores.MENU_STORE, Stores.TPL_STORE, Stores.ACTION_STORE, Stores.SECTION_STORE)],

	getDefaultProps: function() {
		return {};
	},

	getInitialState: function() {
		return {};
	},
	startGuiders: function() {
		this.getFlux().actions.showComponent(CM.PAGE_GROUP_GUIDER);
		// this.props.intro.start();
	},

	getStateFromFlux: function() {
		var SiteState = this.getFlux().store(Stores.SITE_STORE).getState(),
			ChannelState = this.getFlux().store(Stores.CHANNEL_STORE).getState(),
			ColorTemplateState = this.getFlux().store(Stores.TPL_STORE).getState(),
			ContextMenuState = this.getFlux().store(Stores.MENU_STORE).getState(),
			ActionsStore = null;
		if (ChannelState.activeChannel) {
			ActionsStore = this.getFlux().store(Stores.ACTION_STORE).getState(ChannelState.activeChannel.id);
		} else {
			ActionsStore = this.getFlux().store(Stores.ACTION_STORE).getState();
		}
		return {
			'Site': SiteState,
			'Channel': ChannelState,
			'ContextMenu': ContextMenuState,
			'ColorTemplates': ColorTemplateState,
			'ActionsStore': ActionsStore
		};
	},

	render: function() {
		var audiences = this.state.Site.audiences || [],
			adNetworks = this.state.Site.adNetworks || [],
			templates = this.state.ColorTemplates.templates || [],
			actions = this.state.ActionsStore.actions || [],
			adSizes = this.state.Site.adSizes || [],
			customSizesTemp = _(adSizes).filter({ layoutType: 'CUSTOM' }),
			customSizes = customSizesTemp && customSizesTemp.length ? customSizesTemp[0].sizes : [],
			cmsInfo = this.state.Site.cmsInfo || [],
			adsense = _(this.state.Site.adNetworks).findWhere({ name: AM.actions.ADSENSE }),
			channelApexIncontentSections = [],
			channelSections,
			AdsenseAction;

		if (audiences.length) {
			AdsenseAction = this.getFlux().store(Stores.ACTION_STORE).getActionBykey(AM.levels.SITE, null, audiences[0].id, AM.actions.ADSENSE);
		}

		if (this.state.Site.apex && this.state.Channel.activeChannel) {
			channelSections = this.getFlux().store(Stores.SECTION_STORE).getChannelSection(this.state.Channel.activeChannel.id);
			if (channelSections.length) {
				channelApexIncontentSections = _(channelSections).filter({isIncontent: true});
			}
		}


		return (
			<div id="editor">

				{(this.state.Site.loadingStatus !== CommonConsts.enums.status.SUCCESS) ? <SiteLoadingModal status={this.state.Site.loadingStatus}/> : null}

				<DebugInfo info={this.state.ContextMenu.debugInfo}/>
				<Notifications notifications={this.state.Channel.notifications} />
				<Loader loading={this.state.Channel.loading} />
				<Wizard site={window.ADP_SITE_DOMAIN} active={  !window.ADP_HAS_SITE_OBJECT } slideFinishCallback={ this.startGuiders } />
				<ChannelManager
					allChannels={this.state.Channel.channels}
					siteMode={this.state.Site.apConfigs.mode}
					adRecoverMode={this.state.Site.apConfigs.adRecover ? this.state.Site.apConfigs.adRecover.mode : 2}
					audiences={audiences}
					adNetworks={adNetworks}
					templates={templates}
					intro={this.props.intro}
					apex = {this.state.Site.apex}
					glassVisibility={this.state.ContextMenu.menuVisibility}
					state={this.state.Channel}
					cmsInfo={cmsInfo} />

				{this.state.Channel && this.state.Channel.activeChannel && this.state.Channel.openChannels.length ? <SectionManager adNetworks={adNetworks}
					sections={this.getFlux().store(Stores.SECTION_STORE).getChannelSection(this.state.Channel.activeChannel.id) }
					channel={this.state.Channel.activeChannel}
					templates={templates}
					flux={this.getFlux() }/>
					: null}


				{this.state.Site.savingStatus ? <AfterSaveModal status={this.state.Site.savingStatus} flux={this.getFlux() } /> : null}


				{/* Help Trigger */}
				<HelpTrigger flux={this.getFlux() }/>


				{/* Insert Menu */}
				{
					this.state.ContextMenu.visibleComponent === CM.INSERT_CONTEXTMENU ? <InsertMenu
						adSizes={adSizes}
						audiences={audiences}
						intro={this.props.intro}
						position  = {this.state.ContextMenu.position}
						insertOptions= {this.state.ContextMenu.insertOptions}
						apex = {this.state.Site.apex}
						parents= {this.state.ContextMenu.parents} /> : null
				}

				{/* Edit Menu */}
				{
					this.state.ContextMenu.visibleComponent === CM.EDIT_CONTEXTMENU ? <EditMenu adSizes={this.props.adSizes}
						adSizes={adSizes}
						intro={this.props.intro}
						section = {this.state.ContextMenu.section}
						adNetworks={adNetworks}
						templates={templates}
						activeChannel = {this.state.Channel.activeChannel}
						audiences = {audiences}
						position  = {this.state.ContextMenu.position}
						adSize  = {this.state.ContextMenu.adSize}
						apex = {this.state.Site.apex}
						audienceId  = {this.state.ContextMenu.audienceId}/> : null
				}

				{/* Channel Menu */}
				{
					this.state.ContextMenu.visibleComponent === CM.CHANNEL_MENU ? <ChannelMenu
						channel={this.state.Channel.activeChannel}
						inContentSettings={this.state.Channel.activeChannel.incontentSettings}
						cmsInfo={cmsInfo}
						intro={this.props.intro}
						audiences = {audiences}
						customSizes = {customSizes}
						inContentAction = {_(actions).findWhere({ key: AM.actions.SIZES, owner: AM.levels.INCONTENT_SECTION, ownerId: this.state.Channel.activeChannel.id }) }
						apex = {this.state.Site.apex}
						apexIncontentSections = {channelApexIncontentSections}
						position={this.state.ContextMenu.position} /> : null
				}

				{/* Other Options Menu */}
				{
					this.state.ContextMenu.visibleComponent === CM.MISC_MENU ? <MiscMenu
						allChannels={this.state.Channel.channels}
						position={this.state.ContextMenu.position}
						adsense={adsense}
						audiences={audiences}
						templates={templates}
						apex = {this.state.Site.apex}
						adpushupPercentage={this.state.Site.apConfigs.adpushupPercentage}
						apConfigs={this.state.Site.apConfigs}
						flux={this.getFlux() }
						intro={this.props.intro}
						action={AdsenseAction}/> : null
				}

				{/* New Channel Menu */}
				{
					this.state.ContextMenu.visibleComponent === CM.NEW_CHANNEL_MENU ? <NewChannelMenu
						adRecover={this.state.Site.adRecover}
						position={this.state.ContextMenu.position}
						channels={this.state.Channel.channels}
						intro={this.props.intro}
						apex = {this.state.Site.apex}
						cmsInfo={cmsInfo} /> : null
				}

				{/* Guider Page Group */}
				{
					this.state.ContextMenu.visibleComponent === CM.PAGE_GROUP_GUIDER ? <PageGroupGuider/> : null
				}

				{/* Guider Ad Insertion */}
				{
					this.state.ContextMenu.visibleComponent === CM.AD_INSERTION_GUIDER ? <AdInsertionGuider/> : null
				}

				{/* Publish Helper */}
				{
					this.state.ContextMenu.visibleComponent === CM.PUBLISH_HELPER ? <PublishHelper
						oAuthStatus={adsense.pubId ? true : false}
						url={this.state.Channel.channels.length ? this.state.Channel.channels[0].sampleUrl : null}
						mode={this.state.Site.apConfigs.mode}
						flux={this.getFlux() }
						position={this.state.ContextMenu.position}
						/> : null
				}

				{/* Oauth Guider */}
				{
					this.state.ContextMenu.visibleComponent === CM.OAUTH_GUIDER ? <PublishGuider guider="oauth"/> : null
				}

				{/* Control Conversion Guider */}
				{
					this.state.ContextMenu.visibleComponent === CM.CONTROL_CONVERSION_GUIDER ? <PublishGuider guider="control"/> : null
				}

				{/* Adpushup Insatllation Guider */}
				{
					this.state.ContextMenu.visibleComponent === CM.ADPUSHUP_INSTALLATION_GUIDER ? <PublishGuider guider="ap"/> : null
				}


				{/* FAQ */}
				{
					this.state.ContextMenu.visibleComponent === CM.FAQ ? <Faq flux={this.getFlux() }/> : null
				}

				{/* CODE EDITOR */}
				{
					this.state.ContextMenu.visibleComponent === CM.CODE_EDITOR ? <CodeEditor isAdRecover={(this.state.Channel.activeChannel && this.state.Channel.activeChannel.isAdRecover) ? true : false} isApex={this.state.Site.apex} flux={this.getFlux() } data={this.state.ContextMenu.componentData} /> : null
				}

				{/* NETWORK MANAGER */}
				{
					this.state.ContextMenu.visibleComponent === CM.NETWORK_MANAGER ? <NetworkManager flux={this.getFlux() } defaultAudience={audiences[0]} site={this.state.Site} networksActions={ _(actions).where({ dataType: AM.datatypes.ADNETWORK, owner: AM.levels.SITE }) } /> : null
				}

				{/* Popup Info Box*/}
				{
					(this.state.Channel.activeChannel && this.state.Channel.activeChannel.isAdRecover) ?
						<PopupInfoBox areaInAds={this.state.ContextMenu.adRecover.areaInAds} isVisible={this.state.ContextMenu.adRecover.visible} viewportDimensions={this.state.ContextMenu.adRecover.viewportDimensions} /> : null
				}

			</div>
		);
	}
});
